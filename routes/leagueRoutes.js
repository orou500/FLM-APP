const { Router } = require('express')
const leagueController = require('../controllers/leagueController')

const router = Router()

router.post('/leagues/add', leagueController.league_post)
router.get('/leagues', leagueController.league_get)

module.exports = router