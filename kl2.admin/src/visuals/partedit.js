import React from 'react';
import languages from '../data/languages';
import { SelectButton } from 'primereact/selectbutton';
import BaseComponent from '../components/basecomponent';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { Dialog } from 'primereact/dialog';
import DocSelect from '../visuals/docselect';
import comm from '../modules/comm';
import serverdata from '../data/serverdata.json';



class PartEdit extends BaseComponent {



    LanguageSelectItems;

    constructor(props) {
        super(props);



        this.SetContentValue = this.SetContentValue.bind(this);
        this.StartPutLink = this.StartPutLink.bind(this);
        this.EndPutLink = this.EndPutLink.bind(this);
        this.PutLegal = this.PutLegal.bind(this);
        this.RemoveLegal = this.RemoveLegal.bind(this);


        this.LanguageSelectItems = languages.map((item, i) => { return { label: item.title, value: item.key } });

        this.state.language = languages[0].key;

        this.qlEditor = React.createRef();

        this.dsDoc = React.createRef();


        this.state.text = this.props.getProperty(this.state.language, "text");
        this.state.ShowSelectDocumentDialog = false;

    }



    SetContentValue(value) {
        this.setState({ text: value })

        this.props.setProperty(this.state.language, "text", value);

    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.selectedNodeId !== prevProps.selectedNodeId || this.state.language !== prevState.language) {
            //this.setState({ _dt: Date.now() });
            var s = this.props.getProperty(this.state.language, "text");
            this.setState({ text: s });
        }
    }


    StartPutLink() {
        this.dsDoc.current.GoToStart();

        this.setState({ ShowSelectDocumentDialog: true })
    }

    EndPutLink(id, partid) {
        var range = this.qlEditor.current.editor.getSelection();
        if (range) {
            let text = this.qlEditor.current.editor.getText(range.index, range.length);
            this.qlEditor.current.editor.deleteText(range.index, range.length)
            this.qlEditor.current.editor.insertText(range.index, text, {
                'link': id + '|' + (partid ? partid : "")
            });
        }

        this.setState({ ShowSelectDocumentDialog: false })
    }

    PutLegal() {
        var range = this.qlEditor.current.editor.getSelection();
        if (range) {
            let text = this.qlEditor.current.editor.getText(range.index, range.length);
            this.qlEditor.current.editor.deleteText(range.index, range.length)
            this.qlEditor.current.editor.insertText(range.index, text, {
                'background': "#FFFF00"
            });
        }


    }

    RemoveLegal() {
        var range = this.qlEditor.current.editor.getSelection();
        if (range) {
            let text = this.qlEditor.current.editor.getText(range.index, range.length);
            this.qlEditor.current.editor.deleteText(range.index, range.length)
            this.qlEditor.current.editor.insertText(range.index, text);
        }


    }

    async imageHandler() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async function () {
            const file = input.files[0];
            console.log('User trying to uplaod this:', file);

            var id = null;
            const data = new FormData();
            data.append('image', file, file.name);

            await comm.Instance().post("admin/SaveImage", data)
                .then(result => id = result.data);



            //await uploadFile(file); // I'm using react, so whatever upload function
            const range = this.quill.getSelection();
            const link = serverdata.url + "admin/GetImage?imageHash=" + id;

            // this part the image is inserted
            // by 'image' option below, you just have to put src(link) of img here. 
            this.quill.insertEmbed(range.index, 'image', link);
        }.bind(this); // react thing
    }




    render() {
        var self = this;

        var modules = {
            toolbar:
            {
                container: [
                    [{ 'header': '1' }, { 'header': '2' }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' },
                    { 'indent': '-1' }, { 'indent': '+1' }],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: { "image": self.imageHandler }


            }

        };

        var formats = [
            'header', 'color', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image'
        ];

        return (


            [

                <div className="row">
                    <Dialog header={self.T("selectdocument")} visible={this.state.ShowSelectDocumentDialog} style={{ width: '50vw' }}
                        modal={true} onHide={() => self.setState({ ShowSelectDocumentDialog: false })} >
                        <DocSelect onlyDocument={false} selectSuccess={self.EndPutLink} ref={this.dsDoc}></DocSelect>
                    </Dialog>

                    <div className="col-2">
                        <div class="checkbox">
                            <label><input type="checkbox" checked={self.props.getProperty(null, "annulled")} onChange={(e) => self.props.annullePart(e.target.checked)} />{self.T("annulled")}</label>
                        </div>
                    </div>
                    <div className="col-10">
                        {
                            self.props.annuledInfo ?
                                <label>{self.props.annuledInfo.title[self.SM.GetLanguage()]} {self.props.annuledInfo.part[self.SM.GetLanguage()]}</label>
                                : null
                        }
                    </div>
                </div>,
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
                        <div class="quill ql-toolbar ql-snow">
                            <button onClick={self.StartPutLink} className="btn btn-default"><i className="fas fa-link"></i></button>
                            <button onClick={self.PutLegal} className="btn btn-default"><i className="fas fa-book"></i></button>
                            <button onClick={self.RemoveLegal} className="btn btn-default"><i className="fas fa-book-dead"></i></button>
                        </div>
                        <ReactQuill value={this.state.text}
                            onChange={this.SetContentValue}
                            theme="snow"
                            modules={modules}
                            formats={formats}
                            ref={this.qlEditor}

                        />

                    </div>

                </div>

            ]
        )
    }
}

export default PartEdit;