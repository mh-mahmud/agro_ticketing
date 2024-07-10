import React, { useState } from "react";
import MyEditor from "./../../components/common/MyEditor";

export default function RichEditor(props) {
    const [editor, setEditor] = useState(null);
    return (
        <>
            <MyEditor
                handleChange={(data) => {
                    setEditor(data);
                }}
                data={editor}
                {...props}
            />
        </>
    );
}
