import React from 'react';
import { PlanoService } from "@intechprev/prevsystem-service";

import DataInvalida from '../../_utils/Data';
import { Page } from "../";
import { Box, CampoEstatico, CampoTexto, Button, Form, Alert, Row, Col, TipoAlerta, TipoBotao } from "@intechprev/componentes-web";

interface Props {
    match?: any;
}

interface State {
    modalVisivel: boolean,
    dataInicio: string,
    dataFim: string,

    cdPlano: string,
    plano: any,
    extrato: any,
    dependentes: any
}

export default class DetalhesPlano extends React.Component<Props, State> {

    private page = React.createRef<Page>();
    private form = React.createRef<Form>();
    private alert = React.createRef<Alert>();

    constructor(props: Props) {
        super(props);

        this.state = {
            modalVisivel: false,
            dataInicio: "",
            dataFim: "",

            cdPlano: props.match.params.plano,
            plano: {
                SalarioContribuicao: 0
            },
            extrato: {},
            dependentes: []
        }
    }

    componentDidMount = async () => {
        try {
            var plano = await PlanoService.BuscarPorCodigo(this.state.cdPlano);

            await this.setState({ plano });

            this.page.current.loading(false);
        } catch(err) {
            console.error(err);
        }
    }

    /** 
     * @description Método que altera o state 'modalVisivel' que, consequentemente, deixa a modal visível ou não. Além disso, ao fechar a modal, os states de registros devem 
     * permanecer vazios e os states de erro devem receber'false'. Ao abrir a modal, os states recebem os valores default. 
     */ 
    toggleModal = async () => {
        await this.setState({
            dataInicio: "",
            dataFim: "",
            modalVisivel: !this.state.modalVisivel
        });
    }

    renderModal = () => {
        if (this.state.modalVisivel) {
            return (
                <div className="modal" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">Período</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => this.toggleModal()}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            
                            <Form ref={this.form}>
                                <div className="modal-body">
                                    <Row>
                                        <Col className={"col-lg-6"}>
                                            <CampoTexto contexto={this} nome={"dataInicio"} mascara={"99/99/9999"} obrigatorio valor={this.state.dataInicio} 
                                                        label={"Data de Início"} /> {/** adicionar propriedade underline em campo texto, se necessário seguir padrão */}
                                        </Col>

                                        <Col className={"col-lg-6"}>
                                            <CampoTexto contexto={this} nome={"dataFim"} mascara={"99/99/9999"} obrigatorio valor={this.state.dataFim} 
                                                        label={"Data Final"} />  {/** adicionar propriedade underline em campo texto, se necessário seguir padrão */}
                                        </Col>
                                    </Row>
                                    <div></div>
                                </div>

                                <Alert ref={this.alert} padraoFormulario tipo={TipoAlerta.danger} /> {/** tamanho={"5"} rowClassName={"justify-content-end"} style={{marginRight: 15}} */}
                                <div className="modal-footer">
                                    <Button titulo={"Gerar"} tipo={TipoBotao.primary} submit onClick={this.gerarExtrato} />
                                </div>
                            </Form>

                        </div>
                    </div>
                </div>
            );
        }
        else
            return <div></div>

    }

    gerarExtrato = async () => {
        try {
            await this.alert.current.limparErros();
            await this.form.current.validar();
            
            var dataInicio = this.converteData(this.state.dataInicio);
            var dataFim = this.converteData(this.state.dataFim);

            await this.validarData(this.state.dataInicio, dataInicio, "Data de Início");
            await this.validarData(this.state.dataFim, dataFim, "Data Fim");
            
            if(dataInicio > dataFim)
                this.alert.current.adicionarErro("A data inicial é superior à data final");
    
            if(dataFim > new Date())
                this.alert.current.adicionarErro("A data final é superior à data atual");
    
            if(this.alert.current.state.mensagem.length === 0 && this.alert.current.props.mensagem.length === 0) {
                dataInicio = this.state.dataInicio.replace(new RegExp('/', 'g'), '.');
                dataFim = this.state.dataFim.replace(new RegExp('/', 'g'), '.');

                var relatorio = await PlanoService.RelatorioExtratoPorPlanoReferencia(this.state.cdPlano, dataInicio, dataFim);
    
                console.log(relatorio);
                const blobURL = window.URL.createObjectURL(new Blob([relatorio]));
                const tempLink = document.createElement('a');
                tempLink.style.display = 'none';
                tempLink.href = blobURL;
                tempLink.setAttribute('download', "Extrato.pdf");
    
                if (typeof tempLink.download === 'undefined') {
                    tempLink.setAttribute('target', '_blank');
                }
    
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
                window.URL.revokeObjectURL(blobURL);
            }
            
        } catch(err) {
            console.error(err);
        }
    }

    validarData = async (data: string, dataObjeto: Date, nomeCampo: string) => {
        if(DataInvalida(dataObjeto, data))
            await this.alert.current.adicionarErro(`Campo "${nomeCampo}" inválido.`);
    }

    converteData = (data: any) => {
        var dataObjeto = data.split("/");
        dataObjeto = new Date(dataObjeto[2], dataObjeto[1] - 1, dataObjeto[0]);
        return dataObjeto;
    }

    render() {
        return(
            <Page {...this.props} ref={this.page}>
            <Row>
                <Col tamanho={"6"}>
                    <Box>
                        <div className="form-row">
                            <CampoEstatico titulo="Plano" valor={this.state.plano.DS_PLANO} />
                        </div>
                        
                        <div className="form-row">
                            <CampoEstatico titulo="Situação no Plano" valor={this.state.plano.DS_CATEGORIA} col="6" />
                            <CampoEstatico titulo="Data de inscrição" valor={this.state.plano.DT_INSC_PLANO} col="6" />
                        </div>
                        
                    </Box>
                </Col>

                <Col tamanho={"6"}>
                    <Box titulo={"RESGATE"}>

                        <div className="form-row">
                            <CampoEstatico titulo="Saldo" valor={"R$ 231.952,00"} col="6" />
                        </div>

                        <div className="form-row">
                            <CampoEstatico titulo="Valor Adicional" valor={"R$ 115.976,00"} col="6" />
                            <CampoEstatico titulo="Valor Total" valor={"R$ 347.928,00"} col="6" />
                        </div>

                        <div className="form-row">
                            <CampoEstatico titulo="Outros Descontos" valor={"R$ 231.952,00"} col="6" />
                            <CampoEstatico titulo="Valor Isento de Tributação" valor={"R$ 7.083,63"} col="6" />
                        </div>

                        <div className="form-row">
                            <CampoEstatico titulo="IRPF" valor={"R$ 92.862,84"} col="6" />
                            <CampoEstatico titulo="Valor Total" valor={"R$ 210.180,16"} col="6" />
                        </div>

                        <div className="form-row btn-toolbar">
                            <div className="btn-group mr-2">
                                <Button tipo={TipoBotao.primary} className={"btn-md"} 
                                        titulo={"Gerar Extrato"} onClick={() => this.toggleModal() } />
                            </div>

                            {this.renderModal()}

                        </div>

                    </Box>
                </Col>
            </Row>
            </Page>
        );
    }

}