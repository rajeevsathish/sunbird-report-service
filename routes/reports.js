const Router = require('express-promise-router');

const validate = require('../middleware/validators');
const { search, create, remove, read, update, publish, retire, readWithDatasets } = require('../controllers/report');
const { setApiResponseId } = require('../middleware/utils/setApiResponseId');
const summaryRoutes = require('./summary');
const { REPORT } = require('../resources/routes.json');
const { verifyToken } = require('../middleware/authentication/tokenValidator');
const { fetchUserDetails } = require('../middleware/authentication/userDetails');

const router = new Router();
module.exports = router;

router.post(
    REPORT.LIST.URL,
    setApiResponseId(REPORT.LIST.API_ID),
    validate(REPORT.LIST.VALIDATE.KEY, REPORT.LIST.VALIDATE.PATH),
    verifyToken({ tokenRequired: false }),
    fetchUserDetails(),
    search
);

router.post(
    REPORT.CREATE.URL,
    setApiResponseId(REPORT.CREATE.API_ID),
    validate(REPORT.CREATE.VALIDATE.KEY, REPORT.CREATE.VALIDATE.PATH),
    create
)

router.get(
    REPORT.READ.URL,
    setApiResponseId(REPORT.READ.API_ID),
    verifyToken({ tokenRequired: false }),
    fetchUserDetails(),
    read
);

router.get(
    REPORT.READ_WITH_DATASETS.URL,
    setApiResponseId(REPORT.READ_WITH_DATASETS.API_ID),
    verifyToken({ tokenRequired: false }),
    fetchUserDetails(),
    readWithDatasets
);

router.get(
    REPORT.READ_HASH.URL,
    setApiResponseId(REPORT.READ_HASH.API_ID),
    verifyToken({ tokenRequired: false }),
    fetchUserDetails(),
    read
);

router.delete(
    REPORT.DELETE.URL,
    setApiResponseId(REPORT.DELETE.API_ID),
    remove
);

router.delete(
    REPORT.DELETE_HASH.URL,
    setApiResponseId(REPORT.DELETE_HASH.API_ID),
    remove
);

router.patch(
    REPORT.UPDATE.URL,
    setApiResponseId(REPORT.UPDATE.API_ID),
    validate(REPORT.UPDATE.VALIDATE.KEY, REPORT.UPDATE.VALIDATE.PATH),
    update
);

router.get(
    REPORT.PUBLISH.URL,
    setApiResponseId(REPORT.PUBLISH.API_ID),
    publish
)

router.get(
    REPORT.PUBLISH_HASH.URL,
    setApiResponseId(REPORT.PUBLISH_HASH.API_ID),
    publish
)

router.get(
    REPORT.RETIRE.URL,
    setApiResponseId(REPORT.RETIRE.API_ID),
    retire
)

router.get(
    REPORT.RETIRE_HASH.URL,
    setApiResponseId(REPORT.RETIRE_HASH.API_ID),
    retire
)

router.use('/summary', summaryRoutes);




