import React from 'react';
import { Row, Col, Box, Botao, CampoTexto, Form, Alerta, TipoBotao, TipoAlerta } from '@intechprev/componentes-web';
import { RelacionamentoService } from "@intechprev/prevsystem-service";

import { Page } from "../";
import { NumFuncionalidade } from '../Page';

interface Props {
}

interface State {
    email: string;
    assunto: string;
    mensagem: string;
}

export class Relacionamento extends React.Component<Props, State> {

    private page = React.createRef<Page>();
    private form = React.createRef<Form>();
    private alert = React.createRef<Alerta>();

    constructor(props: Props) {
        super(props);

        this.state = {
            email: "",
            assunto: "",
            mensagem: "",
        }
    }

    componentDidMount() {
        this.page.current.loading(false);
    }

    validar = async () => {
        await this.alert.current.limparErros();
        await this.form.current.validar();

        if(this.alert.current.state.mensagem.length === 0 && this.alert.current.props.mensagem.length === 0) {
            try { 
                await RelacionamentoService.Enviar(this.state.email, this.state.assunto, this.state.mensagem);
                alert("Mensagem enviada com sucesso!");
                await this.limparCampos();
            } catch(err) {
                if(err.response)
                    alert(err.response.data);
                else
                    console.error(err);
            }
        } else {
            
        }
    }

    /**
     * @description Método que limpa os states de campo para limpar o formulário de nova mensagem.
     */
    limparCampos = () => {
        this.setState({
            email: "",
            assunto: "",
            mensagem: "",
        })
    }

    render() {
        return (
            <Page Funcionalidade={NumFuncionalidade.FALE_CONOSCO_MENSAGENS} {...this.props} ref={this.page}>
                <Row>
                    <Col>
                        <Box>
                            <Form ref={this.form}>
                                <CampoTexto contexto={this} nome={"email"} max={50} valor={this.state.email} titulo={"Seu e-mail"} tipo={"email"} />
                                <CampoTexto contexto={this} nome={"assunto"} max={50} valor={this.state.assunto} titulo={"Assunto"} obrigatorio />
                                <CampoTexto contexto={this} nome={"mensagem"} max={4000} textarea valor={this.state.mensagem} rows={10} titulo={"Mensagem"} obrigatorio />

                                <Botao titulo={"Enviar"} tipo={TipoBotao.primary} submit onClick={this.validar} />
                                <br /><br />
                                <Alerta ref={this.alert} padraoFormulario tipo={TipoAlerta.danger} tamanho={"6"}/>
                            </Form>
                        </Box>
                    </Col>
                </Row>
            </Page>
        )
    }
}
