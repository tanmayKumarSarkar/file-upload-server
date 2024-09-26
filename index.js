const { default: axios } = require("axios")
const fs = require('fs');

const path = 'files/file.txt'
const file = fs.readFileSync(path) /** Read file */
const stats = fs.statSync(path) /** Get file size in bytes (for content-length) */
const fileSizeInBytes = stats.size;

/** Add appropriate headers */
const headers = {
  'Authorization': 'Bearer Your Token', /** Optional */
  'Content-Length': fileSizeInBytes, /** Recommended to add it */
  'Content-Type': 'application/octet-stream',
}
let url = "https://www.example.com/remote-server-upload-urlSS"

axios.post(url, file, {
    headers: headers,
    maxContentLength: Infinity, /** To avoid max content length error */
    maxBodyLength: Infinity /** To avoid max body length error */
}).then((response) => {
    return response.data
}).catch((error) => {
    return error
})