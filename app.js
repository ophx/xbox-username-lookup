require("dotenv").config();
const express = require("express");
const path = require("path");
const moment = require("moment");
const app = express();
const base = "/api/v1";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// routes
app.get("/", async (req, res) => {
    res.render("index");
});

// api routes
app.get(`${base}/xbox`, async (req, res) => {
    try {
        const username = req.query.username;
    
        const response = await fetch(`https://xapi.us/api/${encodeURI(username)}/profile-for-gamertag`, {
            headers: { "Authorization": `Bearer ${process.env.XAPIUS_API_KEY}` }
        });
        const data = await response.json();
    
        const response2 = await fetch(`https://xapi.us/api/${data.id}/titlehub-achievement-list`, {
            headers: { "Authorization": `Bearer ${process.env.XAPIUS_API_KEY}` }
        });
        const data2 = await response2.json();

        const response3 = await fetch(`https://xapi.us/api/${data.id}/friends`, {
            headers: { "Authorization": `Bearer ${process.env.XAPIUS_API_KEY}` }
        });
        const data3 = await response3.json();

        const response4 = await fetch(`https://xapi.us/api/${data.id}/profile`, {
            headers: { "Authorization": `Bearer ${process.env.XAPIUS_API_KEY}` }
        });
        const data4 = await response4.json();
        
        const limit = 5;
        const games = data2.titles.slice(0, limit).map((game) => {
            return `${game.name} - ${moment(game.titleHistory.lastTimePlayed).format("lll")}`;
        });
    
        res.json({
            status: 200,
            xuid: data.id,
            avatar: data.settings[4].value,
            username: data.settings[0].value,
            gamerscore: data.settings[3].value,
            tier: data4.detail.accountTier,
            rep: data.settings[7].value,
            yearsOnXbox: data.settings[9].value,
            recentGames: games,
            friends: data3.totalCount,
            realName: data4.realName,
            presence: data4.presenceState,
            presenceText: data4.presenceText,
            bio: data4.detail.bio,
            followers: data4.detail.followerCount,
            following: data4.detail.followingCount,
        });
    } catch (err) {
        res.json({
            status: 500,
        });
    }
});

app.listen(8000, () => {
    console.log("Server is now running on port 8000!");
    console.log("View here: http://localhost:8000/");
});