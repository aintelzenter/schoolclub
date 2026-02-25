# Club Images

Club header backgrounds and galleries use images from `public/clubs/PHOTOS/`. Paths are set in `data/clubs.json` (e.g. `"image": "/clubs/PHOTOS/Operation Smile/MainSmile.PNG"`).

## Expected folder structure

Place images so the paths in `clubs.json` resolve under `public/`:

| Club              | Folder path (under `public/clubs/PHOTOS/`) |
|-------------------|---------------------------------------------|
| Operation Smile   | `Operation Smile/`                          |
| School Show       | `School Show/Frozen/`, `School Show/BATB/`, `School Show/Aladdin/`, `School Show/Little Mermaid/` |
| MUN               | `MUN/`                                      |
| SPARK Club        | `SPARK Club/`                               |
| Interact Club     | `Interact Club/`                            |
| Eco Committee     | `Eco Committee/`                            |
| Duke of Edinburgh | `Duke of Edinburgh/`                        |
| UNICEF Ambassador | `UNICEF Ambassador/`                        |
| TEDx              | `TEDX/`                                     |

Example: for Operation Smile, add files such as:
- `public/clubs/PHOTOS/Operation Smile/MainSmile.PNG`
- `public/clubs/PHOTOS/Operation Smile/IMG_3036.JPG`
- etc.

The **first image** in each club’s `image` or `images` in `clubs.json` is used as the club page header background. If that file is missing (404), the header falls back to the gradient automatically.

## Image guidelines

- **Format**: JPG or PNG
- **Dimensions**: e.g. 800×600 or 4:3 for header backgrounds
- **Size**: Keep under ~200KB for faster loading
