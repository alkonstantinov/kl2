import React, { Component } from 'react';
import languages from '../data/languages';
import { InputText } from 'primereact/inputtext';

class MLEdit extends Component {
    // constructor(props) {
    //     super(props);




    // }



    render() {
        var self = this;

        return (
            <div>
                {
                    languages.map((obj, i) =>
                        <div className="row" key={i}>
                            <div className="col-3">
                                {obj.title}
                            </div>
                            <div className="col-9">
                                <InputText value={self.props.parent[obj.key]} onChange={(e) => self.props.change(obj.key, e.target.value)} className="form-control" />
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default MLEdit;