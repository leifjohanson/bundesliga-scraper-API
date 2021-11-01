const PORT = 8080
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')


async function getStat() {
    try {
        var siteURL = 'https://www.bbc.com/sport/football/german-bundesliga/top-scorers'

        const { data } = await axios({
            method: "GET",
            url: siteURL,
        })

        const $ = cheerio.load(data)
        const elementSelector = 'div > div.gel-layout.gel-layout--center > div > div:nth-child(2) > div.qa-scorers-table > div > table > tbody > tr'

        const keys = [
            'rank',
            'playerNameClubName',
            'goals',
            'assists',
            'gamesPlayed',
            'goalsPer90',
            'minsPerGoal',
            'totalShots',
            'goalConversion',
            'shotAccuracy'
        ]

        const playerArray = []

        $(elementSelector).each((parentIndex, parentElement) => {
            const playerObject = {}
            if(parentIndex <= 19) {
                $(parentElement).children().each((childIndex, childElement) => {
                    let value = $(childElement).text()

                    if(childIndex == 1) {
                        value = $('span > span:first-of-type', $(childElement).html()).text()
                    }

                    if(value) {
                        playerObject[keys[childIndex]] = value
                    }

                })
                playerArray.push(playerObject)
            }
        })

        return playerArray
    } catch(err) {
        console.error(err)
    }
}

const app = express()

app.get('/player-stats', async(_, res) => {
    try {
       const playerStats = await getStat()

       return res.status(200).json({
            bundesliga: playerStats,
       })
    } catch(err) {
        return res.status(500).json({
            err: err.toString()
        })
    }
})

app.listen(PORT, () => {
    console.log("running on port " + PORT)
})