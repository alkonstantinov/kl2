import React from 'react';
import languages from '../data/languages';
import { SelectButton } from 'primereact/selectbutton';
import BaseComponent from '../components/basecomponent';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { stateToHTML } from "draft-js-export-html";


class PartEdit extends BaseComponent {
    LanguageSelectItems;
    constructor(props) {
        super(props);
        this.GetContentValue = this.GetContentValue.bind(this);
        this.SetContentValue = this.SetContentValue.bind(this);


        this.LanguageSelectItems = languages.map((item, i) => { return { label: item.title, value: item.key } });

        this.state.language = languages[0].key;

    }

    GetContentValue() {
        var blocksFromHTML = convertFromHTML(
            this.props.getProperty(this.state.language, "text")
        );
        var content = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap
        );

        return EditorState.createWithContent(content);
    }

    SetContentValue(editorState) {
        this.props.setProperty(this.state.language, "text", stateToHTML(editorState.getCurrentContent()))

    };

    componentDidUpdate(prevProps) {
        if (this.props.selectedNodeId !== prevProps.selectedNodeId) {
            this.setState({ _dt: Date.now() });
        }
    }



    render() {
        var self = this;
        return (
            [
                <div className="row">
                    <div className="col-12">
                        <SelectButton value={self.state.language} options={self.LanguageSelectItems} onChange={(e) => self.setState({ language: e.value, _dt: Date.now() })}></SelectButton>
                    </div>
                </div>,
                <div className="row">
                    <div className="col-12">
                        <label className="control-label">{self.T("title")}</label>
                        <input type="text" className="form-control"
                            value={self.props.getProperty(self.state.language, "title")} onChange={(e) => { self.props.setProperty(self.state.language, "title", e.target.value) }}></input>
                    </div>

                </div>,
                <div className="row">
                    <div className="col-12" key={self.state._dt}>
                        <label className="control-label">{self.T("content")}</label>
                        <Editor
                            defaultEditorState={self.GetContentValue()}
                            onEditorStateChange={this.SetContentValue}
                            toolbar={{
                                options: ['image'],

                                image: {
                                    urlEnabled: false,
                                    uploadEnabled: true,
                                    uploadCallback: self.uploadCallback

                                }
                            }}
                        />
                    </div>

                </div>

            ]
        )
    }
}

export default PartEdit;