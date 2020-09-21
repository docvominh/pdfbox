var selectedAttachmentId;
var selectedAttachmentUrl;
var dragCounter = 0;
var uploadUrl;

window.onload = function () {
    let div = document.createElement('div');
    div.setAttribute('id', 'fileMessageContainer')
    div.setAttribute('style', 'position: fixed;top: 75px;right: 10px;z-index:-1;width: 40vw;min-height: 100px;background-color: rgba(235, 255, 252, 0.5);color: #00947e;border: 1px solid #00947e;border-radius: 4px;padding: 10px;opacity: 0;transition: opacity 1500ms ease 0s;');
    div.innerHTML = '<div id="fileMessagePanel" style="position: relative"><i id="x-close" style="position: absolute;top: -13px;right: -8px;font-size: 20px;cursor: pointer">&nbsp;&times;&nbsp;</i><div id="panelContent" style="padding-top: 10px;word-break: break-word"></div></div>';
    document.body.appendChild(div);


    let imageBoxOverlay = document.createElement('div');
    imageBoxOverlay.setAttribute('class', 'image-box-overlay');


    let imageBoxWrap = document.createElement('div');
    imageBoxWrap.setAttribute('class', 'image-box-wrap');

    let imageViewNode = document.createElement('div');
    imageViewNode.setAttribute('id', 'imageViewBox');

    let image = document.createElement('img');
    image.setAttribute('id', 'imageView');

    let close = document.createElement('a');
    close.setAttribute('class', 'image-box-close')
    imageViewNode.appendChild(close);
    imageViewNode.appendChild(image);
    imageBoxWrap.appendChild(imageViewNode);

    document.body.appendChild(imageBoxWrap);
    document.body.appendChild(imageBoxOverlay);

    document.querySelector('.image-box-close').addEventListener('click', hideImageBox)

    document.getElementById("x-close").addEventListener("click", function () {
        hideFileMessage()
    });
}

function Attachment(config) {
    this.selector = config.selector;
    this.container = document.getElementById(config.selector);
    this.targetId = config.targetId;
    this.uploadUrl = config.uploadUrl;
    this.getAttachmentUrl = config.getAttachmentUrl;
    uploadUrl = config.uploadUrl;


    this.init = function () {

        // Clear old container
        let oldContainer = document.querySelector('.attachment-area');

        if (oldContainer != null) {
            oldContainer.innerHTML = '';
        }

        this.container.classList.add('attachment-area')
        this.container.innerHTML = '';
        let actionNode = document.createElement('div');
        actionNode.setAttribute('id', 'attachmentAction')
        actionNode.innerHTML = '<label for="uploadAttachment" class="button">Upload</label><input id="uploadAttachment" type="file" name="files" multiple="true" />';

        let menuNode = document.createElement('div');
        menuNode.setAttribute('id', 'attachmentContextMenu');
        menuNode.setAttribute('class', 'context-menu');

        let ulNode = document.createElement('ul');
        let li1 = document.createElement('li');
        li1.setAttribute('id', 'copyUrl');
        li1.append(document.createTextNode('Copy'));

        let li2 = document.createElement('li');
        li2.setAttribute('id', 'removeImage');
        li2.append(document.createTextNode('Remove'));

        ulNode.appendChild(li1)
        ulNode.appendChild(li2);
        menuNode.appendChild(ulNode);

        let attachmentArea = document.createElement('div');
        attachmentArea.setAttribute('id', 'attachmentArea')
        this.container.append(actionNode);
        this.container.append(attachmentArea);
        this.container.append(menuNode);

        // Set upload url to dom for use in addEventListener
        this.container.querySelector('#uploadAttachment').setAttribute('data-upload-url', this.uploadUrl);
        this.container.querySelector('#uploadAttachment').setAttribute('data-target-id', this.targetId);

        // event
        this.container.addEventListener('dragenter', dragenter);
        this.container.addEventListener('dragleave', dragleave);
        this.container.addEventListener('drop', drop);

        this.container.querySelector('#attachmentArea').addEventListener('click', viewImage);
        this.container.querySelector('#attachmentArea').addEventListener('contextmenu', contextmenu);
        this.container.querySelector('#uploadAttachment').addEventListener('change', upload);
        this.container.querySelector('#copyUrl').addEventListener('click', copy);
        this.container.querySelector('#removeImage').addEventListener('click', removeAttachment);
        return this;
    }

    this.getAttachment = function () {
        let root = this.container;
        requestAjaxAttachmentGet('GET', this.getAttachmentUrl, this.targetId,
            function (response) {
                if (response.code == 'SUCCESS') {
                    displayNewUpload(root, response);
                }
            },
            function (response) {
                console.log(this.response);
            });
    }

    this.destroy = function () {
        this.container.removeEventListener('dragenter', dragenter);
        this.container.removeEventListener('dragleave', dragleave);
        this.container.removeEventListener('drop', drop);

        if (this.container.querySelector('#attachmentArea') != null) {
            this.container.querySelector('#attachmentArea').removeEventListener('contextmenu', contextmenu);
        }

        if (this.container.querySelector('#uploadAttachment') != null) {
            this.container.querySelector('#uploadAttachment').removeEventListener('change', upload);
        }
        if (this.container.querySelector('#copyUrl') != null) {
            this.container.querySelector('#copyUrl').removeEventListener('click', copy);
        }
        if (this.container.querySelector('#removeImage') != null) {
            this.container.querySelector('#removeImage').removeEventListener('click', removeAttachment);
        }

        // Remove html
        this.container.innerHTML = '';
    }
}

function viewImage(event) {
    if (event.target && event.target.closest('div').classList.contains('enable-view')) {
        showImageBox(event.target.getAttribute('src'))
    }
}

function showImageBox(src) {
    document.getElementById('imageView').setAttribute('src', src);
    document.querySelector('.image-box-wrap').style.display = 'block'
    document.querySelector('.image-box-overlay').style.display = 'block'

    let width = document.getElementById('imageViewBox').offsetWidth;
    let height = document.getElementById('imageViewBox').offsetHeight;

    document.querySelector('.image-box-wrap').style.left = (window.innerWidth - width)/2 + 'px';
    document.querySelector('.image-box-wrap').style.top = (window.innerHeight - (height +20))/2 + 'px';
}

function hideImageBox() {
    document.querySelector('.image-box-wrap').style.display = 'none'
    document.querySelector('.image-box-overlay').style.display = 'none'
}

function dragenter(event) {
    event.preventDefault();
    let root = event.target.closest('.attachment-area');
    dragCounter++;
    root.style.border = '2px dashed #eb7c2d';
}

function dragleave(event) {
    event.preventDefault();
    let root = event.target.closest('.attachment-area');
    dragCounter--;
    if (dragCounter == 0) {
        root.style.border = '1px dashed #c1c7d0';
    }
}

function drop(event) {
    dragCounter = 0;
    let root = event.target.closest('.attachment-area');
    root.style.border = '1px dashed #c1c7d0';

    let formData = new FormData();
    formData.append('targetId', document.getElementById('uploadAttachment').getAttribute('data-target-id'));
    let files = event.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    requestAjaxAttachment('POST', uploadUrl, formData,
        function (response) {
            if (response.code == 'SUCCESS') {
                showFileMessage(response.messages)
                displayNewUpload(event.target.closest('.attachment-area'), response);
                document.getElementById('uploadAttachment').value = '';
            }
        },
        function (response) {
            console.log(this.response);
            // failedCallback(response);
        });
}

function contextmenu(event) {
    if (event.target && event.target.closest('div').classList.contains('uploaded-file')) {
        event.preventDefault();
        displayGalleryMenu(event.target.closest('.attachment-area'), event.target.offsetTop, event.target.offsetLeft);
        selectedAttachmentId = event.target.closest('div').getAttribute('data-id');
        selectedAttachmentUrl = event.target.closest('div').getAttribute('data-url');
    } else {
        hideGalleryMenu(event.target.closest('.attachment-area'));
    }
}

function upload(event) {
    let root = event.target.closest('.attachment-area')
    let count = root.querySelector('#uploadAttachment').files.length;
    let formData = new FormData();
    formData.append('targetId', event.target.getAttribute('data-target-id'));

    for (let i = 0; i < count; i++) {
        formData.append("files", document.getElementById('uploadAttachment').files[i]);
    }

    requestAjaxAttachment('POST', event.target.getAttribute('data-upload-url'), formData,
        function (response) {
            if (response.code == 'SUCCESS') {
                showFileMessage(response.messages)
                displayNewUpload(root, response);
                root.querySelector('#uploadAttachment').value = '';
            }
        },
        function (response) {
            console.log(this.response);
        });
}

function copy() {
    navigator.clipboard.writeText(selectedAttachmentUrl);
}

function removeAttachment() {
    let formData = new FormData();
    formData.append('fileId', selectedAttachmentId);

    requestAjaxAttachment('POST', '/file/deleteAttachment', formData,
        function (response) {
            if (response.code == 'SUCCESS') {
                let deleteFile = document.querySelector('div[data-id="' + selectedAttachmentId + '"]');
                deleteFile.remove();
                document.querySelector('input[value="' + selectedAttachmentId + '"]').remove();
                showFileMessage(response.messages)
            }
        },
        function (response) {
            console.log(this.response);
        });
}

document.addEventListener('click', function (event) {
    if (event.target && !event.target.classList.contains('uploaded-image')) {
        hideGalleryMenu(event.target.closest('.attachment-area'));
    }
})

window.addEventListener("dragover", function (event) {
    event.preventDefault();
}, false);

function displayNewUpload(root, data) {
    for (let i = 0; i < data.files.length; i++) {
        let hiddenNode = document.createElement("input");
        hiddenNode.setAttribute('type', 'hidden')
        hiddenNode.value = data.files[i].id;
        hiddenNode.setAttribute('name', 'fileIds[' + i + ']')

        let node = document.createElement('div');
        node.classList.add('uploaded-file')
        node.setAttribute('data-id', data.files[i].id);
        node.setAttribute('data-url', data.files[i].fileUrl);
        let fileName = data.files[i].name;
        let fileType = fileName.substring(fileName.indexOf('.') + 1).toLowerCase();

        if (fileType == 'png' || fileType == 'jpg' || fileType == 'jpeg' || fileType == 'gif' || fileType == 'webp') {
            node.classList.add('enable-view')
            node.innerHTML = '<img src="' + data.files[i].fileUrl + '" title="' + data.files[i].name + '"/>';
        } else if (fileType == 'dwg') {
            node.innerHTML = '<a href="' + data.files[i].fileUrl + '" title="' + data.files[i].name + '"><img src="/images/dwg.png" title="' + data.files[i].name + '"/>' + data.files[i].name + '</a>'
        } else {
            node.innerHTML = '<a href="' + data.files[i].fileUrl + '" title="' + data.files[i].name + '"><img src="/images/file.png" title="' + data.files[i].name + '"/>' + data.files[i].name + '</a>'
        }


        if (root != null) {
            root.querySelector('#attachmentArea').prepend(hiddenNode);
            root.querySelector('#attachmentArea').appendChild(node);
        }
    }
}

window.addEventListener("drop", function (event) {
    event.preventDefault();
}, false);

function displayGalleryMenu(parent, x, y) {
    let menu = parent.querySelector('.context-menu');
    if (menu != null) {
        menu.style.top = (x + 30) + 'px';
        menu.style.left = (y + 80) + 'px';
        menu.style.display = 'block';
    }
}

function hideGalleryMenu(parent) {
    if (parent != null) {
        let menu = parent.querySelector('.context-menu');
        if (menu != null) {
            menu.style.display = 'none'
        }
    }
}

function requestAjaxAttachment(method, url, formData, successCallback, errorCallback) {

    // Display the key/value pairs
    // for (let pair of formData.entries()) {
    //     console.log(pair[0] + ', ' + pair[1]);
    // }


    let request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            let response = JSON.parse(this.response);
            successCallback(response);
        } else {
            let response = JSON.parse(this.response);
            console.log('SERVER RETURN ERROR');
            errorCallback(response);
        }
    }

    request.onerror = function () {
        showAjaxFailedMessage();
        console.log(this.response)
    }

    request.send(formData);
}

function requestAjaxAttachmentGet(method, url, targetId, successCallback, errorCallback) {

    url = url += '?targetId=' + targetId;

    let request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {

            let response = JSON.parse(this.response);
            console.log(response)
            successCallback(response);
        } else {
            let response = JSON.parse(this.response);
            console.log('SERVER RETURN ERROR');
            errorCallback(response);
        }
    }

    request.onerror = function () {
        showAjaxFailedMessage();
        console.log(this.response)
    }

    request.send();
}

function showFileMessage(message) {
    for (let i = 0; i < message.length; i++) {
        let node = document.createElement('span');
        node.style.display = 'block';
        node.innerHTML = message[i];
        document.getElementById('panelContent').appendChild(node);
    }

    let target = document.getElementById('fileMessageContainer')
    target.style.opacity = '1';
    target.style.zIndex = '9999';
    setTimeout(function () {
        hideFileMessage();
    }, 6000);
}

function hideFileMessage() {
    document.getElementById('panelContent').innerHTML = '';
    let target = document.getElementById('fileMessageContainer')
    target.style.opacity = '0';
    target.style.zIndex = '-1';
}