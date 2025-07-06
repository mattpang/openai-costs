OpenAI doesn't put their model token costs as an API. 

Didn't see anyone else fetch live pricing so I made one. This repo has a Github action (runs at midnight) that grabs them and spaffs it into the file `openai-prices.json`.

The Playwright Chromium is cloaked so cloudfront doesn't block it with a capture challenge. 


Actually just go use this instead: https://github.com/sst/models.dev