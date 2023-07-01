const { Component, h, render } = window.preact;


class App extends Component {

    componentDidMount() {
        this.setState({ message: 'Hello!' });
    }
    render(props, state) {

        return (
            h('div',
                { id: 'app' },
                h(GlPfForm, { message: state.message })
            )
        );
    }
}

class GlPfForm extends Component {

    handleClick = (event) => {
        const dataToSave = []
        document.querySelectorAll('div[data-testid="ci-variable-row"]').forEach((item) => {
            const keyInput = item.querySelector('input[data-testid="pipeline-form-ci-variable-key"]')
            const valInput = item.querySelector('textarea[data-testid="pipeline-form-ci-variable-value"]')
            dataToSave.push({
                key: keyInput.value,
                value: valInput.value
            })
        })
        let saveKey = prompt('Please enter form name:');
        const repoKey = btoa(location.href)

        let formData = localStorage.getItem(repoKey)

        if (formData) {
            formDataJson = JSON.parse(formData)
            formDataJson[saveKey] = dataToSave
        } else {
            formDataJson = {}
            formDataJson[saveKey] = dataToSave
        }

        localStorage.setItem(repoKey, JSON.stringify(formDataJson))
        return false
    }

    render(props, state) {
        return h('div', { className: "gl-pf-form-app", style: "margin-left:10px" },
            h('button', { 
                className: "gl-pf-save-bttn btn btn-confirm btn-default btn-md gl-mr-3 gl-button",
                onClick: this.handleClick
            }, null, 'Save & Run'),
            props.message && h(Dropdown, null, props.message)
        );
    }
}

class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: ''
        };
    }

    handleChange = (event) => {
        this.setState({ selectedOption: event.target.value });
    }

    render() {
        const repoKey = btoa(location.href)
        let formData = localStorage.getItem(repoKey)
        let formDataJson = JSON.parse(formData)
        const options = [
            h('option', { value: '' }, 'Select an option')
        ]

        const getForms = () => {
            for (let formName of Object.keys(formDataJson)){
                options.push(
                    h('option', { value: formName }, formName)
                )
            }
            return options
        }

        return h('select', {
            className: "btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle",
            id: this.props.id,
            onChange: this.handleChange
        }, getForms())
    }
}


(function () {

    function renderForm() {
        render(h(App), document.querySelector(".gl-pf-form"));
    }

    function createContainer() {
        const contaienrDiv = document.createElement("div")

        contaienrDiv['id'] = 'gl-pf-form'
        contaienrDiv['data-name'] = 'gl-pf-form'
        contaienrDiv.classList.add("gl-pf-form")

        const pipelineButton = document.body.querySelector('button[data-qa-selector="run_pipeline_button"]')
        pipelineButton?.parentNode?.appendChild(contaienrDiv)

    }


    const insertButton = () => {
        console.log("insertButton")
        const pathName = document.location.pathname
        const geJsonButton = document.querySelector('.gl-pf-form')
        if (geJsonButton) {
            return false
        }

        createContainer()
        renderForm()
    }

    insertButton()

    setInterval(insertButton, 3000)

})()
