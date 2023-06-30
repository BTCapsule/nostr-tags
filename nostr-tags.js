
function loadNostrToolsScript() {
    return new Promise((resolve, reject) => {
        const nostrTools = document.createElement('script');
        nostrTools.src = 'https://unpkg.com/nostr-tools/lib/nostr.bundle.js';
        nostrTools.onload = resolve;
        nostrTools.onerror = reject;
        document.head.appendChild(nostrTools);
    });
}

function launchClient(link) {



    window.location.href = 'https://snort.social/' + link;


}

async function processBodyContent() {
    await loadNostrToolsScript();

    let profileData = {};

    const getProfileData = async (npub) => {
        if (profileData[npub]) {
            return profileData[npub];
        }

        const metadata = await new Promise((resolve, reject) => {
            const relay = window.NostrTools.relayInit('wss://relay.nostr.band');

            relay.on('connect', async () => {
                console.log(`connected to ${relay.url}`);

                try {
                    const fetchedData = await relay.get({
                        authors: [npub],
                        kinds: [0],
                    });

                    profileData[npub] = fetchedData;
                    resolve(fetchedData);
                } catch (error) {
                    reject(`Failed to fetch user profile: ${error}`);
                } finally {
                    relay.close();
                    console.log('relay closed')
                }
            });

            relay.on('error', (error) => {
                reject(`Failed to connect to ${relay.url}: ${error}`);
                relay.close();
            });

            relay.connect();
        });

        if (!metadata) {
            throw new Error('Failed to fetch user profile :(');
        }

        return metadata;
    };

    const extractProfile = (profileMetadata) => {
        return JSON.parse(profileMetadata.content);
    }
    const getUser = async (hexKey) => {
        try {
            const metadata = await getProfileData(hexKey);
            const profileContent = extractProfile(metadata);

            const username = profileContent.name;
            return username;
        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    };




    let contents = document.body.innerHTML;

    const matches = contents.match(/nostr:([^\s]+)/g);

    if (matches) {
        matches.forEach(async (match, index) => {
            const extractedString = match.substring(6);

            if (extractedString.startsWith('npub')) {
                // Handle 'npub' case
                const punctuation = extractedString.match(/[^\w\s]/g);
                const content = extractedString.replace(/[^\w\s]/g, '');

                const decodedString = JSON.stringify(window.NostrTools.nip19.decode(content));
                const parsedDecodedString = JSON.parse(decodedString);
                const dataTag = parsedDecodedString.data;
                console.log(dataTag + ' decode');

                const divId = `some-container-name-${index}`;

                const divElement = document.createElement('span');
                divElement.id = divId;


                divElement.style.display = 'inline';
                divElement.style.overflow = 'hidden';
                divElement.style.whiteSpace = 'nowrap';


                const linkElement = document.createElement('a');
                linkElement.href = '#';
                linkElement.onclick = () => launchClient(content);
                linkElement.textContent = '';

                divElement.appendChild(linkElement);


                if (punctuation) {
                    contents = contents.replace(match, divElement.outerHTML + punctuation);
                } else {

                    contents = contents.replace(match, divElement.outerHTML);
                }


                let name;
                try {
                    name = await getUser(dataTag);
                    updateLinkElement(name);
                } catch (error) {
                    console.error('Error:', error.message);
                }
                console.log(name + ' name');

                function updateLinkElement(name) {
                    const render = document.querySelector(`#${divId}`);
                    if (render) {
                        const existingLinkElement = render.querySelector('a');
                        existingLinkElement.href = '#';


                        existingLinkElement.onclick = () => launchClient(content);
                        existingLinkElement.textContent = name;




                    }
                }
            } else if (extractedString.startsWith('note')) {
                // Handle 'note' case
                const decodedString = window.NostrTools.nip19.decode(extractedString);
                const newNote = decodedString.data;

                const divId = `some-container-id-${index}`;

                const divElement = document.createElement('div');
                divElement.id = divId;


               divElement.style.display = 'block';
                divElement.style.width = "600px";
                divElement.style.margin = "0 auto";

                //divElement.style.marginRight="auto";


                const scriptCode = `
              setTimeout(function() {
                const n = document.createElement('script');
                n.type = 'text/javascript';
                n.async = true;
                n.src = 'https://cdn.jsdelivr.net/gh/nostrband/nostr-embed@latest/dist/nostr-embed.js';
                n.onload = function() {
                  nostrEmbed.init(
                    '${newNote}',
                    '#${divId}',
                    'wss://relay.damus.io'
                  );
                };
								
                const a = document.getElementsByTagName('script')[0];
                a.parentNode.insertBefore(n, a);
              }, ${index * 200}); // Delay based on the index of the div element
            `;

                const scriptElement = document.createElement('script');
                scriptElement.text = scriptCode;

                divElement.appendChild(scriptElement);
                document.body.appendChild(divElement);

                contents = contents.replace(match, divElement.outerHTML);



            }
        });
    }

    document.body.innerHTML = contents;
    
}

document.addEventListener('DOMContentLoaded', processBodyContent);