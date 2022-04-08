const { Router } = require('express')
const leagueController = require('../controllers/leagueController')
const { checkAuth } = require('../middlewares/checkAuth')

const router = Router()

router.post('/leagues/add', checkAuth, leagueController.league_post)
router.get('/leagues', checkAuth, leagueController.leagues_get)
router.get('/league/:id', checkAuth, leagueController.oneleague_get)
router.delete('/league/:id', checkAuth, leagueController.league_delete)
router.put('/league/edit/:id', checkAuth, leagueController.updateLeague)

module.exports = router