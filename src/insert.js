const { Component, h, render } = window.preact;

function plainString(str) {
    str = str.trim();
    str = str.replace(/[^\w\s]/gi, '');
    return str
}

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
        const repoKey = plainString(location.href)
        let formData = localStorage.getItem(repoKey)
        let formDataJson = {}

        let saveKey = prompt('Please enter form name:');
        if (formData) {
            formDataJson = JSON.parse(formData)
            formDataJson[saveKey] = dataToSave
        } else {
            formDataJson[saveKey] = dataToSave
        }

        localStorage.setItem(repoKey, JSON.stringify(formDataJson))

        console.log("JSON.stringify(formDataJson)", JSON.stringify(formDataJson))

        event.preventDefault();
    }

    render(props, state) {
        return h('div', { className: "gl-pf-form-app", style: "margin-left:10px" },
            h('button', {
                className: "btn btn-default btn-md gl-mr-3 gl-button",
                onClick: this.handleClick
            }, null, 'Save form'),
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

    simulateTyping = (inputElement, text) => {
        const keydownEvent = new KeyboardEvent('keydown');
        const keyupEvent = new KeyboardEvent('keyup');
        const inputEvent = new InputEvent('input');
        const focusEvent = new FocusEvent('focus');
        const blurEvent = new FocusEvent('blur');
        const changeEvent = new Event('change');
        inputElement.dispatchEvent(focusEvent);

        inputElement.value = text;
        inputElement.dispatchEvent(keydownEvent);
        inputElement.dispatchEvent(inputEvent);
        inputElement.dispatchEvent(keyupEvent);

        inputElement.dispatchEvent(changeEvent);
        inputElement.dispatchEvent(blurEvent);

    }

    handleChange = async (event) => {
        this.setState({ selectedOption: event.target.value });
        const repoKey = plainString(location.href)
        let formData = localStorage.getItem(repoKey)
        if (formData) {
            let formDataJson = JSON.parse(formData)

            for (let formItem of formDataJson[event.target.value]) {
                const keyInputs = document.querySelectorAll('input[data-testid="pipeline-form-ci-variable-key"]')
                const valInputs = document.querySelectorAll('textarea[data-testid="pipeline-form-ci-variable-value"]')

                keyInputs.length && this.simulateTyping(keyInputs[keyInputs.length - 1], formItem?.key)
                valInputs.length && this.simulateTyping(valInputs[valInputs.length - 1], formItem?.value)
                await new Promise(r => setTimeout(r, 100));
            }
        }

    }

    render() {
        const repoKey = plainString(location.href)
        let formData = localStorage.getItem(repoKey)
        let formDataJson = JSON.parse(formData)
        const options = [
            h('option', { value: '' }, 'Select a form')
        ]

        const getForms = () => {
            for (let formName of Object.keys(formDataJson)) {
                options.push(
                    h('option', { value: formName }, formName)
                )
            }
            return options
        }

        if (formData) {
            return h('select', {
                className: "btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle",
                id: this.props.id,
                onChange: this.handleChange
            }, getForms())
        }
        return null
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
        const pathName = document?.location?.pathname
        if (!pathName?.includes("pipelines/new")){
            return
        }
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
