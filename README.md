<p align="center"><a href="https://enbizcard.vercel.app/"><img src="app/assets/images/GitHub.png" width="100%"></a></p>

<h1 align="center">An Open-Source Digital Business Card Generator</h1>
<!-- <h3 align="center">Your Website Can Host Your Digital Business Cards for FREE!</h3> -->
<h3 align="center">Why Pay When Your Digital Business Cards Can Be Hosted on Your Website for Free!</h3>
<p align="center">EnBizCard helps you create interactive and responsive HTML-based digital business cards that can be hosted with your website.</p>
<h3 align="center"><a href="https://enbizcard.vercel.app">Open App</a> | <a href="https://enbizcard.vercel.app">View demo</a></h3>

---

<p align="center">
<a href="https://www.gnu.org/licenses/agpl-3.0" alt="License: GPLv3"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue"></a> <a href="https://github.com/CapsaicinBunny/EnBizCard/issues" alt="GitHub issues"><img src="https://img.shields.io/github/issues/CapsaicinBunny/EnBizCard?label=Issues"></a></p>

<p align="center">Made with ❤️ by <a href="https://github.com/CapsaicinBunny">CapsaicinBunny</a> &amp; <a href="https://www.vishnuraghav.com/">Vishnu Raghav</a></p>

<p align="center"><em>A fork of <a href="https://github.com/vishnuraghavb/EnBizCard">vishnuraghavb/EnBizCard</a>, migrated to Nuxt 4 / Vue 3 and TypeScript.</em></p>

---

## Goals

- Minimize the cost of paying third-party services to host your digital business cards
- Elegant design and functionality
- Quick and easy setup

## Features

- Concise action buttons
- Click to contact via Phone, WhatsApp, Email, etc
- Direct vCard download (lets user download your contact information to their phone)
- Social media links
- PGP public key sharing
- Share your card with anyone using QR-code or link
- Showcase images, artworks, music, videos, poems, brochures, products, services or anything up to your imagination
- Embed any kind of HTML content (videos, music, maps, contact forms, you name it.)
- Themes
- Track your audience with analytics
- Custom fonts

## Highlights

- Zero limitations
- Your data belongs to you
- Private by design — nothing you type ever leaves your browser ([privacy policy](PRIVACY.md))

## Having issues, suggestions and feedback?

- [Create an issue here](https://github.com/CapsaicinBunny/EnBizCard/issues) for anything specific to this fork.
- For the original project, see [vishnuraghavb/EnBizCard](https://github.com/vishnuraghavb/EnBizCard).

## Self-Hosting Guide - Docker

In order to quickly host the EnBizCard Generator on a machine running Docker and Docker Compose, follow these steps:

1. Clone the repository to your machine and `cd` into the directory.

```
git clone git@github.com:CapsaicinBunny/EnBizCard.git
```

2. Create a .env file by copying and adjusting env.example:

```
cp env.example .env
```

3. Run `docker-compose up -d`
4. Access the app at http://localhost:22212 (or a different port, in case you edited the .env file).

## Credits

- [QRCode-SVG](https://github.com/papnkukn/qrcode-svg) (MIT) generates the QR code, in the app and inside exported cards.
- Logo and original artwork by [Vishnu Raghav](https://www.vishnuraghav.com/).

### Icons

The icons in `app/assets/icons/` are **inlined into generated cards**, so these
terms travel with anything you export — not just with this repository.

| Source                              | Used for                | Licence   | Attribution                  |
| ----------------------------------- | ----------------------- | --------- | ---------------------------- |
| [SVG Stack](https://svgstack.com)   | brand and service logos | CC BY 4.0 | **required** — credited here |
| [Boxicons](https://boxicons.com/)   | interface icons         | MIT       | licence text                 |
| [Feather](https://feathericons.com) | interface icons         | MIT       | licence text                 |

Because the brand set is CC BY rather than public domain, **anyone publishing an
exported card is redistributing CC BY artwork** and inherits the attribution
requirement. Crediting SVG Stack somewhere on the hosting site satisfies it.

Brand names and logos are trademarks of their respective owners, used here only
to identify the services a card links to.

## License

```
EnBizCard - An Open-Source Digital Business Card Generator
Copyright (C) 2021  Vishnu Raghav B

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

```
