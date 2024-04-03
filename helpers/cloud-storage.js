const _ = require('lodash');
const { envVariables } = require('./envHelpers');
const cloudService = require('client-cloud-services');

if (!envVariables.sunbird_cloud_storage_provider) throw new Error("Cloud Storage Service - Provider is not initialized");

let cloudConfig = {
    provider: envVariables.sunbird_cloud_storage_provider,
    identity: envVariables.sunbird_cloud_storage_key,
    credential: envVariables.sunbird_cloud_storage_secret,
    privateObjectStorage: envVariables.sunbird_cloud_storage_container,
    publicObjectStorage: envVariables.sunbird_cloud_storage_labels,
    region: envVariables.sunbird_cloud_storage_region,
    projectId: envVariables.sunbird_cloud_storage_project,
    endpoint:envVariables.sunbird_cloud_storage_endpoint  
};
let cloudClient = cloudService.init(cloudConfig);
const storageService =  cloudClient;//new cloudClient(cloudConfig);

const getSharedAccessSignature = ({ container = cloudConfig.reportsContainer, filePath, headers = {}, expiryTime = sasExpiryTime }) => {
    return new Promise((resolve, reject) => {
        try {
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + expiryTime);
            startDate.setMinutes(startDate.getMinutes() - expiryTime);

            const signedUrl = storageService.getSignedUrl(container, filePath, expiryDate)
            resolve({ signedUrl, expiresAt: Date.parse(expiryDate), startDate });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { getSharedAccessSignature };