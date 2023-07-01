# nostr-tags

Nostr-tags lets you use NIP-21 format to tag profiles and embed notes on your HTML.

To use nostr-tags, add the following script to the bottom of your `<body>` tag:
	
`<script src= "https://cdn.jsdelivr.net/gh/btcapsule/nostr-tags@latest/nostr-tags.js"></script>`
	
Now, whenever you use something like:
	
`nostr:npub1v6xwae25wh6etmqw3m6yce9lnk5dnhtqpzk9fhxjfvjsryctjc8q2kxk5t`

Your page will display:

`BTCapsule 🏴🧡`

You can also embed notes with the same syntax, and nostr-tags will use [Brugeman's nostr-embed](https://github.com/nostrband/nostr-embed) to embed the note.
