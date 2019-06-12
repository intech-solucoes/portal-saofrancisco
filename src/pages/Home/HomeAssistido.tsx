import React from "react";
import { Page } from "..";
import { Row, Col, Box, CampoEstatico, TipoCampoEstatico } from "@intechprev/componentes-web";
import { HomeCard } from "./HomeCard";
import { PlanoService, CalendarioPagamentoService, FichaFinanceiraAssistidoService, ProcessoBeneficioService } from "@intechprev/prevsystem-service";

interface Props { }

interface State {
    planos: Array<any>;
    ultimaFolha: any;
    dataAposentadoria: any;
    processoBeneficio: any;
    calendario: Array<any>;
}

export class HomeAssistido extends React.Component<Props, State> {

    private page = React.createRef<Page>();

    componentDidMount = async () => {
        this.page.current.loading(true);

        var planos = await PlanoService.Buscar();
        var ultimaFolha = await FichaFinanceiraAssistidoService.BuscarUltimaPorPlano(planos[0].CD_PLANO);
        var processoBeneficio = await ProcessoBeneficioService.BuscarPorPlano(planos[0].CD_PLANO);
        var calendario = await CalendarioPagamentoService.Buscar();
        await this.setState({ planos, ultimaFolha, processoBeneficio, calendario });
        
        this.page.current.loading(false);
    }

    render() {
        return (
            <Page {...this.props} ref={this.page}>
                {this.page.current &&
                    <div>
                        <Row>
                            <Col>
                                <HomeCard titulo={this.state.planos[0].DS_PLANO}>
                                    {this.state.planos[0].DS_CATEGORIA}
                                </HomeCard>
                            </Col>
                            <Col>
                                <HomeCard titulo={"Situação"}>
                                    {this.state.processoBeneficio.DS_ESPECIE}
                                </HomeCard>
                            </Col>
                            <Col>
                                <HomeCard titulo={"Data de Início do Benefício"}>
                                    {this.state.processoBeneficio.DT_INICIO_FUND}
                                </HomeCard>
                            </Col>
                        </Row>

                        {this.state.processoBeneficio.SALDO_ATUAL &&
                            <Row>
                                <Col>
                                    <HomeCard titulo={"Saldo de Conta Aplicável Atual (SCAA)"}>
                                        <CampoEstatico valor={this.state.processoBeneficio.SALDO_ATUAL} tipo={TipoCampoEstatico.dinheiro} />
                                    </HomeCard>
                                </Col>
                                <Col>
                                    <HomeCard titulo={"Renda - % SCAA"}>
                                        {this.state.processoBeneficio.VL_PARCELA_MENSAL}%
                                    </HomeCard>
                                </Col>
                                <Col>
                                    <HomeCard titulo={"Provável Encerramento do Benefício"}>
                                        {this.state.processoBeneficio.DT_APOSENTADORIA}
                                    </HomeCard>
                                </Col>
                            </Row>
                        }

                        <Row className={"mt-4"}>
                            <Col tamanho={"8"}>
                                <Box titulo={"Contra-cheque"} label={this.state.ultimaFolha.Resumo.Referencia.substring(3)}>
                                    <h2 className={"text-center mb-5"}>Valor Líquido: <CampoEstatico valor={this.state.ultimaFolha.Resumo.Liquido} tipo={TipoCampoEstatico.dinheiro} /></h2>

                                    <table className={"table table-striped table-sm"}>
                                        <thead>
                                            <tr>
                                                <th>Rubrica</th>
                                                <th>Tipo</th>
                                                <th>Competência</th>
                                                <th className={"text-right"}>Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.ultimaFolha.Proventos.map((rubrica: any, index: number) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{rubrica.DS_RUBRICA}</td>
                                                        <td className={"text-success"}>Provento</td>
                                                        <td>{rubrica.DT_COMPETENCIA}</td>
                                                        <td className={"text-right"}>
                                                            <CampoEstatico valor={rubrica.VALOR_MC} tipo={TipoCampoEstatico.dinheiro} />
                                                        </td>
                                                    </tr>
                                                )
                                            })}

                                            {this.state.ultimaFolha.Descontos.map((rubrica: any, index: number) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{rubrica.DS_RUBRICA}</td>
                                                        <td className={"text-danger"}>Desconto</td>
                                                        <td>{rubrica.DT_COMPETENCIA}</td>
                                                        <td className={"text-right"}>
                                                            <CampoEstatico valor={rubrica.VALOR_MC} tipo={TipoCampoEstatico.dinheiro} />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>

                                </Box>
                            </Col>

                            <Col>
                                <Box titulo={"Calendário de Pagamento"}>
                                    <table className={"table table-striped table-sm"}>
                                        <tbody>
                                            {this.state.calendario.map((data: any, index: number) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{data.DES_MES}</td>
                                                        <td className={"text-right"}>{data.NUM_DIA}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </Box>
                            </Col>
                        </Row>
                    </div>
                }
            </Page>
        );
    }
}