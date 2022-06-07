var azure = require('azure-storage');
const _ = require('lodash');

const { envVariables } = require('./envHelpers');
const { AZURE: { account_key, account_name, container_name, sasExpiryTime } } = envVariables;

const blobService = azure.createBlobService(account_name, account_key);

const getBlobReadStream = ({ filePath }) => {
    return blobService.createReadStream(container_name, filePath);
}

const checkIfBlobExists = ({ container = container_name, filePath }) => {
    return new Promise((resolve, reject) => {
        blobService.doesBlobExist(container, filePath, (error, success) => {
            if (error) {
                return reject(error);
            }

            if (success && !success.exists) {
                return reject(false);
            }

            resolve(success);
        })
    })
}

const getSharedAccessSignature = ({ container = container_name, filePath, headers = {}, expiryTime = sasExpiryTime }) => {
    return new Promise((resolve, reject) => {
        try {
            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + expiryTime);
            startDate.setMinutes(startDate.getMinutes() - expiryTime);

            const sharedAccessPolicy = {
                AccessPolicy: {
                    Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
                    Start: startDate,
                    Expiry: expiryDate
                }
            };

            const azureHeaders = {};
            if (('filename' in headers) && ('content-disposition' in headers) && (headers['content-disposition'] === 'attachment')) {
                azureHeaders.contentDisposition = `attachment;filename=${headers.filename}`;
            }

            const token = blobService.generateSharedAccessSignature(container, filePath, sharedAccessPolicy, azureHeaders);
            const sasUrl = blobService.getUrl(container, filePath, token);
            resolve({ sasUrl, expiresAt: Date.parse(expiryDate), startDate });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { getBlobReadStream, getSharedAccessSignature };