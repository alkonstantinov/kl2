import React from 'react';
import languages from '../data/languages';
import { SelectButton } from 'primereact/selectbutton';
import BaseComponent from '../components/basecomponent';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';



class PartEdit extends BaseComponent {



    LanguageSelectItems;

    constructor(props) {
        super(props);



        this.SetContentValue = this.SetContentValue.bind(this);
        

        this.LanguageSelectItems = languages.map((item, i) => { return { label: item.title, value: item.key } });

        this.state.language = languages[0].key;




        this.state.text = this.props.getProperty(this.state.language, "text");

    }



    SetContentValue(value) {
        this.setState({ text: value })
        
        this.props.setProperty(this.state.language, "text", value);

    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.selectedNodeId !== prevProps.selectedNodeId || this.state.language != prevState.language) {
            //this.setState({ _dt: Date.now() });
            var s = this.props.getProperty(this.state.language, "text");
            this.setState({ text: s });
        }
    }




    render() {
        var self = this;
        return (
            [
                <div className="row">
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
                        <ReactQuill value={this.state.text}
                            onChange={this.SetContentValue} 
                            theme="snow"
                            
                            
                            />

                    </div>

                </div>

            ]
        )
    }
}

export default PartEdit;