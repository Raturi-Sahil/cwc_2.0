const express = require('express');
const app = express();
const PORT = 3000;
const user = {
  "login": "Raturi-Sahil",
  "id": 194338216,
  "node_id": "U_kgDOC5VdqA",
  "avatar_url": "https://avatars.githubusercontent.com/u/194338216?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Raturi-Sahil",
  "html_url": "https://github.com/Raturi-Sahil",
  "followers_url": "https://api.github.com/users/Raturi-Sahil/followers",
  "following_url": "https://api.github.com/users/Raturi-Sahil/following{/other_user}",
  "gists_url": "https://api.github.com/users/Raturi-Sahil/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Raturi-Sahil/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Raturi-Sahil/subscriptions",
  "organizations_url": "https://api.github.com/users/Raturi-Sahil/orgs",
  "repos_url": "https://api.github.com/users/Raturi-Sahil/repos",
  "events_url": "https://api.github.com/users/Raturi-Sahil/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Raturi-Sahil/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": "Sahil Raturi",
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 8,
  "public_gists": 0,
  "followers": 2,
  "following": 2,
  "created_at": "2025-01-09T05:43:48Z",
  "updated_at": "2025-05-12T10:21:09Z"
}
app.get('/', (req, res) => {
    console.log("sup buddy");
    res.status(200).json({msg: "Home page."})
});

app.get('/twitter', (req, res)=> {
    console.log("Inside the endpoint twitter");
    res.status(200).json({msg: "U have come to twitter's home page"});
});

app.get('/login', (req, res) => {
    console.log("Inside the login endpoint");
    res.send("<h1> This is where you login </h1>");
});

app.get('/gitinfo', (req, res) => {
    res.json(user);
})

app.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});