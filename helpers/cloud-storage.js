const _ = require('lodash');
const { envVariables } = require('./envHelpers');

if (!envVariables.sunbird_cloud_storage_provider) throw new Error("Cloud Storage Service - Provider is not initialized");

let cloudConfig = {
    identity: envVariables.sunbird_cloud_storage_key,
    credential: envVariables.sunbird_cloud_storage_secret,
    reportsContainer: envVariables.sunbird_cloud_storage_container,
    labelsContainer: envVariables.sunbird_cloud_storage_labels,
    region: envVariables.sunbird_cloud_storage_region,
    projectId: envVariables.sunbird_cloud_storage_project  
};
let cloudClient = cloudService.init(envVariables.sunbird_cloud_storage_provider);
const storageService = new cloudClient(cloudConfig);

const getSharedAccessSignature = ({ container = container_name, filePath, headers = {}, expiryTime = sasExpiryTime }) => {
    return new Promise((resolve, reject) => {
        try {
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + expiryTime);
            startDate.setMinutes(startDate.getMinutes() - expiryTime);

            const sginedUrl = storageService.getSignedUrl(container, filePath, expiryDate)
            resolve({ sginedUrl, expiresAt: Date.parse(expiryDate), startDate });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { getSharedAccessSignature };