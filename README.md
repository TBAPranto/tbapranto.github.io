# Talal Bin Akbor · professional portfolio

This is my portfolio for IT support and networking roles. I describe my Aramex internship and six projects, from the browser desktop I started in 2019 to my three-month final-year capstone in 2026. Each case study includes a visual walkthrough.

## Local preview

Extract the archive into an empty folder. Run the following command from the folder that contains `index.html`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [the local homepage](http://127.0.0.1:8000/). The published pages run directly from HTML, CSS, JavaScript, and local assets. The archived applications are represented through their case studies, evidence images, and external project links.

| File or folder | Purpose |
| --- | --- |
| `index.html` | Profile, experience, four-period project timeline, skills, education, and contact |
| `projects/*.html` | Seven case studies |
| `privacy.html` | Privacy information and acknowledgements |
| `assets/style.css` | Typography, palette, layout, responsive rules, and interaction states |
| `assets/site.js`, `assets/theme.js` | Navigation, appearance, project filters, case study controls, and image previews |
| `assets/media/`, `assets/fonts/` | Responsive portrait, social artwork, project evidence, and locally served typefaces |
| `assets/Talal_Bin_Akbor_Public_CV.pdf` | Two-page public CV with embedded fonts and links to my professional profiles |
| `assets/contact-config.js` | Optional public email. Enable only with explicit owner approval. |
| `robots.txt`, `.nojekyll` | Current crawl settings and GitHub Pages static publication |
| `tools/` | Local link checker and publication metadata utility |

## Deploy through a review branch

The intended destination is [tbapranto.github.io](https://tbapranto.github.io/). The archive starts at the repository root.

1. Clone [the existing portfolio repository](https://github.com/TBAPranto/tbapranto.github.io) and create a review branch.

   ```sh
   git clone https://github.com/TBAPranto/tbapranto.github.io.git
   cd tbapranto.github.io
   git switch -c portfolio-final-review
   ```

2. Extract the release separately, then copy the contents into the checkout, including `.nojekyll` and `.gitignore`. Review any superseded files from the previous release and stage their removal where appropriate.
3. Run the link checker and use the local preview above. Stage the files with `git add -A`, review `git diff --cached`, commit the branch, and open a pull request after pushing it.
4. After review, merge into the configured publishing branch. For a branch-based GitHub Pages site, check **Settings → Pages → Build and deployment** for the intended branch and **/ (root)**. After publishing, verify the homepage, a direct case-study link, and the CV download. See [GitHub’s publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

All delivered pages include `noindex,nofollow`. The delivered `robots.txt` disallows crawling. These directives govern discovery. Host access follows GitHub Pages visibility settings.

### Indexing after approval

Indexing is a separate decision. If you explicitly approve it, this command updates local canonical and social metadata, writes a sitemap, and enables crawling and indexing. Review those changes on a branch before merging.

```sh
python3 tools/configure_publication.py --base-url https://tbapranto.github.io/ --enable-indexing
```

Omit `--enable-indexing` to prepare metadata while retaining review restrictions.

## Maintain this site

- Update the homepage and the relevant case study together when a role, accomplishment, or project claim changes. Preserve page routes and section IDs where possible.
- Keep a descriptive caption and intrinsic dimensions on evidence images. Identify the visible screen, any crop, and whether it comes from a local run, an archive, or a diagram.
- The site follows system appearance on first visit. An explicit choice uses the browser’s local storage. Theme colours and spacing are near the top of `assets/style.css`.
- The skills disclosures work natively. The project list and every walkthrough step remain readable without JavaScript. With JavaScript, the walkthroughs use keyboard-operable tabs, and evidence opens in an image viewer.
- Run `python3 tools/check_local_links.py`. Verify typography, filters, disclosure, image previews, and contact links in the browser after an edit.
- The privacy and credits page records photo, project imagery, and font attribution. Manrope and DM Serif Display license texts are in `assets/fonts/`.
