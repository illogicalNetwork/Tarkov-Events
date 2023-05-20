const express = require('express')
const app = express()
const fs = require('fs')

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  fs.readFile('./data2.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log('File read failed:', err)
      return
    }
    const data = JSON.parse(jsonString)
    const timestamps = data.map(entry =>
      new Date(entry.timestamp).toLocaleTimeString()
    )
    const counts = data.map(entry => parseInt(entry.kills.count))

    const firstTimestamp = new Date(data[0].timestamp)
    const lastTimestamp = new Date(data[data.length - 1].timestamp)
    const timeDifferenceMinutes = (lastTimestamp - firstTimestamp) / (1000 * 60)

    // Calculate elapsed time from the first entry to the current time
    const elapsedTime = Date.now() - firstTimestamp;
    const elapsedTimeMinutes = Math.floor(elapsedTime / (1000 * 60));

    // Total kills is the count at the last timestamp
    const totalKills = counts[counts.length - 1]

    // Stop the script if total kills reached 110,000
    if (totalKills >= 110000) {
      res.send('Kill count reached 110,000. Stopping the script.')
      return
    }

    const killsPerMinute = (totalKills / timeDifferenceMinutes).toFixed(2)

    // Calculate new statistics
    const killsLastMinute =
      counts[counts.length - 1] - counts[counts.length - 2]

    let highestKillsInMinute = 0
    let lowestKillsInMinute = Infinity
    for (let i = 1; i < data.length; i++) {
      const currentTimestamp = new Date(data[i].timestamp)
      const previousTimestamp = new Date(data[i - 1].timestamp)
      const timeDifferenceCurrentMinute =
        (currentTimestamp - previousTimestamp) / (1000 * 60)
      if (timeDifferenceCurrentMinute <= 1) {
        const killsCurrentMinute = counts[i] - counts[i - 1]
        if (killsCurrentMinute > 0) {
          // Add this line
          highestKillsInMinute = Math.max(
            highestKillsInMinute,
            killsCurrentMinute
          )
          lowestKillsInMinute = Math.min(
            lowestKillsInMinute,
            killsCurrentMinute
          )
        }
      }
    }

    res.render('index', {
      timestamps,
      counts,
      killsPerMinute,
      killsLastMinute,
      highestKillsInMinute,
      lowestKillsInMinute,
      elapsedTimeMinutes, 
      totalKills
    })
  })
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
