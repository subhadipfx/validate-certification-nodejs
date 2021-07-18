const {createServer} = require("http");
const {join: joinPaths, extname } = require("path");

const express = require("express");
const multer= require("multer");
const fs = require("fs-extra");
const Excel = require("exceljs");

const app = express();
const diskStorage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, joinPaths(__dirname, 'temp'));
    },
    filename: (req, file, next) => {
        next(null, `Certificates-${Date.now()}${extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: diskStorage
})
const httpServer = createServer(app);


const PORT = parseInt(process.env.PORT) || 3000
const DB_PATH = joinPaths(__dirname,'certificate_list.json');


httpServer.listen(PORT, () => {
    console.log(`App Started at Port: ${PORT}`)
});

function getCertificateList(){
    if(!fs.pathExistsSync(DB_PATH)){
        fs.writeJsonSync(DB_PATH, {})
    }
    return fs.readJsonSync(DB_PATH);
}

function getCertificateDetailsByCertID(cert_id){
    const list = getCertificateList();
    return list[cert_id];
}

app.use(express.json());
app.use(express.static(joinPaths(__dirname, 'public')))


app.post('/api/validate-certification', (request, response) => {
    try{
        const {name, cert_id} = request.body;
        if(!cert_id)
            throw new Error("Certificate ID is invalid");

        const certificate_details = getCertificateDetailsByCertID(cert_id);

        if(!certificate_details)
            throw new Error("No certificate found with this Certificate ID");

        response.json({
            status: "SUCCESS",
            message: "Certificate Found",
            data: certificate_details
        });

    }catch (e) {
        // console.log(e);
        response.json({
            status: "FAILED",
            message: e.message
        });
    }
});

app.post('/api/update-certificate-db', upload.single('cert_file') ,async (request, response) => {
    try{
        if(!request.file){
            throw new Error("File not found");
        }

        const filetype = extname(request.file.originalname);

        if(filetype !== ".xlsx"){
            throw new Error("Filetype not supported");
        }

        const workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(request.file.path);
        const worksheet = workbook.getWorksheet("Sheet1");

        const totalRows = worksheet.rowCount;
        let certificates_list = {};
        for (let rowNum = 2; rowNum <= totalRows; rowNum++){
           const row = worksheet.getRow(rowNum);
           certificates_list[row.getCell(1).value] = {name: row.getCell(2).value};
        }

        const current_json_db = getCertificateList();
        const updated_json_db = {...certificates_list, ...current_json_db};
        fs.writeJsonSync(DB_PATH, updated_json_db);

        response.json({
            statue: "SUCCESS",
            message: "Certificate List Updated Successfully"
        });
    }catch (e){
        console.log(e);
        response.json({
            status: "FAILED",
            message: e.message
        });
    }
});

