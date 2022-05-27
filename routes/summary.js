const Router = require('express-promise-router');

const { listSummaries, createSummary, getLatestSummary } = require('../controllers/summary');
const { setApiResponseId } = require('../middleware/utils/setApiResponseId');
const validate = require('../middleware/validators');
const { SUMMARY } = require('../resources/routes.json');

const router = new Router();
module.exports = router;

router.post(SUMMARY.LIST.URL,
    setApiResponseId(SUMMARY.LIST.API_ID),
    validate(SUMMARY.LIST.VALIDATE.KEY, SUMMARY.LIST.VALIDATE.PATH),
    listSummaries
);

router.post(SUMMARY.CREATE.URL,
    setApiResponseId(SUMMARY.CREATE.API_ID),
    validate(SUMMARY.CREATE.VALIDATE.KEY, SUMMARY.CREATE.VALIDATE.PATH),
    createSummary
);

router.get(SUMMARY.LATEST_REPORT_SUMMARY.URL,
    setApiResponseId(SUMMARY.LATEST_REPORT_SUMMARY.API_ID),
    getLatestSummary
)

router.get(SUMMARY.LATEST_CHART_SUMMARY.URL,
    setApiResponseId(SUMMARY.LATEST_CHART_SUMMARY.API_ID),
    getLatestSummary
)