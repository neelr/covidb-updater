const express = require("express")
const cred = require("./cred.json")
const admin = require("firebase-admin")
const axios = require("axios")

const app = express()

// Initialize firebase app
admin.initializeApp({
    credential: admin.credential.cert({
        ...cred
    }),
    databaseURL: 'https://covidb-a3df4.firebaseio.com/'
});
const db = admin.database();

app.get("/", (req, res) => {
    res.send(`Aloha! I'm a bot, check me out at <a href="https://github.com/neelr/covidb-updater">https://github.com/neelr/covidb-updater</a>`)
})

app.get("/api/updater", async (req, res) => {

    // Get all the data from argis
    const globalConfirmedRes = await axios.get("https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22,%22onStatisticField%22%3A%22Confirmed%22,%22outStatisticFieldName%22%3A%22value%22%7D%5D")
    const globalDeathsRes = await axios.get("https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases/FeatureServer/1/query?f=json&where=Confirmed%20%3E%200&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22,%22onStatisticField%22%3A%22Deaths%22,%22outStatisticFieldName%22%3A%22value%22%7D%5D")
    const usaTestedRes = await axios.get("https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases2_v1/FeatureServer/3/query?f=json&outStatistics=%5B%7B%22statisticType%22%3A%22sum%22,%22onStatisticField%22%3A%22People_Tested%22,%22outStatisticFieldName%22%3A%22value%22%7D%5D")

    // Create empty object to fill
    let currentStats = {}

    // Try catch in case the API updates and the routes are wrong
    try {
        currentStats = {
            "Global Confirmed": globalConfirmedRes.data.features[0].attributes.value,
            "Global Deaths": globalDeathsRes.data.features[0].attributes.value,
            "Total Test Results in US": usaTestedRes.data.features[0].attributes.value
        }
    } catch (e) {
        // Logs for me :)
        console.log(e)
        res.sendStatus(400)
        return
    }

    // Update the DB
    await db.ref("stats/current").set(currentStats)

    res.send(currentStats)
})

app.listen(3000, () => console.log("Open on port 3000"))