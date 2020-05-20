//Function To Upload Data to the server
export function uploadItenerary(itenerary) {
    return new Promise((resolve, reject) => {
        fetch('/upload/itenerary', {
            method: 'POST',
            body: itenerary
        })
            .then(response => {
                okFlag = response.ok;
                return response.text();
            })
            .then(text => {
                if (okFlag)
                    resolve(text);
                reject(text);
            })
            .catch(err => {
                console.log(err);
            });
    });
}
