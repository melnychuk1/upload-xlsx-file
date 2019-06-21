
const inputUpload = document.getElementById('fileUpload');
const dropField = document.getElementById('dropField');
const fileLabelText = document.getElementById("fileLabelText");
let droppedFiles;


// _____________________ select file ________________________

inputUpload.addEventListener('change', addFiles, true);

function addFiles(e) {
    droppedFiles = e.target.files || e.dataTransfer.files;

    handleDropAndSelect(e);

    checkFileSize(droppedFiles, 80000);
    validateFile(droppedFiles);
}

function showFiles(obj) {
    if (obj.length > 1) {
        fileLabelText.innerText = obj.length + " выбрано файлов";
    } else {
        fileLabelText.innerText = `Фаил - "${obj[0].name}"`;
    }
}

function checkFileSize(obj, size) {
    let filesSize = 0;

    for (let prop in obj){
        if (obj.hasOwnProperty(prop)) {
            filesSize = obj[prop].size;
        }
    }

    if (filesSize > size ){
        fileLabelText.innerText = `Допустимый размер файла больше ${size/8000}Мб, выберите другой файл`;
    } else {
        showFiles(obj);
    }
}

function validateFile (files) {

    for (let prop in files){

        if (files.hasOwnProperty(prop)){
            if (files[prop].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
                dropField.classList.remove('not-successful')
            }
            else {
                fileLabelText.innerText = `Не допустимый тип файла ${files[prop].type}, выберите другой файл`;
                dropField.classList.add('not-successful')
            }
        }
    }
}


// ___________________ drag & drop file ______________________

['dragenter', 'dragover'].forEach(eventName => {

    dropField.addEventListener(eventName, (e) => {
        preventDefaults(e);
        dropField.classList.add('highlight');
    }, false)
});

['dragleave', 'drop'].forEach(eventName => {

    dropField.addEventListener(eventName, (e) => {
        preventDefaults(e);
        dropField.classList.remove('highlight')
    }, false)
});

dropField.addEventListener('drop', (e) => {
    addFiles(e);
}, false);

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function uploadFiles(resultArr) {

    let url = 'http://193.243.158.230:4500/api/import';
    fetch(url, {
        method: 'POST',
        body: {
            resultArray: resultArr,
        },
        headers: {
            'Authorization': 'test-task/Object'
        }
    })
        .then(function(response) {
            console.log(response);
        })
        .catch((e) => { console.log(e)});
}

function handleDropAndSelect(e) {
    const dataArray = [];
    let file;

    if (e.dataTransfer){
        file = e.dataTransfer.files;
    }
    else if (e.target){
        file = e.target.files;
    }

    e.stopPropagation();
    e.preventDefault();

    for (let prop in file){

        if (file.hasOwnProperty(prop)){
            let reader = new FileReader();
            reader.onload = function(e) {

                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {type: 'array'});

                dataArray.push(workbook.Sheets);
                uploadFiles(dataArray);
            };

            reader.readAsArrayBuffer(file[prop]);
        }
    }
}

