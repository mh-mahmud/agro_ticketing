import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {API_URL} from "../../Config";
import Token from '../../services/Token';
// import $ from ''

// const URL = `${API_URL}`;
const UPLOAD_ENDPOINT = "ticket/upload-files";

export default function MyEditor({ handleChange, ...props }) {
    function uploadAdapter(loader) {
        return {
            upload: () => {
                return new Promise((resolve, reject) => {
                    const body = new FormData();
                    loader.file.then((file) => {
                        body.append("file", file);
                        body.append("attachment_save_path", 'ticket/media');
                        // console.log(body)

                        fetch(`${API_URL}/${UPLOAD_ENDPOINT}`, {
                            method: "post",
                            headers: {
                                'Authorization': 'Bearer '+(new Token()).get()
                            },
                            body: body,
                            dataType: JSON
                        }).then((res) => {

                            if (res.status_code === 200){
                                console.log(res)
                            }
                        });


                    // .then((res) => {
                    //         resolve({
                    //             default: `${API_URL}/${res.filename}`
                    //         })
                    //         ;
                    //     }).catch((err) => {
                    //         reject(err);
                    //     });
                    });
                });
            }
        };
    }
    function uploadPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            return uploadAdapter(loader);
        };
    }
    return (
        <div className="App">
            <CKEditor
                config={{
                    extraPlugins: [uploadPlugin]
                }}
                editor={ClassicEditor}
                onReady={(editor) => {}}
                onBlur={(event, editor) => {}}
                onFocus={(event, editor) => {}}
                onChange={(event, editor) => {
                    handleChange(editor.getData());
                    const data = editor.getData();
                    // console.log( { event, editor, data } );

                }}
                {...props}
            />
        </div>
    );
}


