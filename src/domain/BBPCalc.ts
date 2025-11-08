export enum RangosDeVivienda {
    R1,
    R2,
    R3,
    R4,
    R5
}

export enum TipoDeVivienda {
    Tradicional,
    Sostenible
}

export class BBPCalc {
    private valorVivienda: number;
    private tipoDeVivienda: TipoDeVivienda;
    private ingresos: number;
    private adultoMayor: boolean;
    private personaDesplazada: boolean;
    private migrantesRetornados: boolean;
    private personaConDiscapacidad: boolean;


    private calcularRango(): RangosDeVivienda {
        const rangos = [
            { min: 68800, max: 98100, rango: RangosDeVivienda.R1 },
            { min: 98101, max: 146900, rango: RangosDeVivienda.R2 },
            { min: 146901, max: 244600, rango: RangosDeVivienda.R3 },
            { min: 244601, max: 362100, rango: RangosDeVivienda.R4 },
            { min: 362101, max: 488800, rango: RangosDeVivienda.R5 }
        ];
        const rangoEncontrado = rangos.find(r => this.valorVivienda >= r.min && this.valorVivienda <= r.max);
        if (!rangoEncontrado) {
            console.warn('[BBPCalc] ⚠️ Valor fuera de rango, usando R5 por defecto');
            return RangosDeVivienda.R5;
        }
        console.log('[BBPCalc] ✅ Rango encontrado:', {
            rango: `R${rangoEncontrado.rango + 1}`,
            min: rangoEncontrado.min,
            max: rangoEncontrado.max,
            valorVivienda: this.valorVivienda
        });
        if (rangoEncontrado) {
            return rangoEncontrado.rango;
        } else {
            return RangosDeVivienda.R5;
        }
    }
    private rango: RangosDeVivienda;

    private valorDelBono(tipoDeVivienda: TipoDeVivienda): number{
        const valoresBBP = {
            tradicional: {
                [RangosDeVivienda.R1]: 27400,
                [RangosDeVivienda.R2]: 22800,
                [RangosDeVivienda.R3]: 20900,
                [RangosDeVivienda.R4]: 7800,
                [RangosDeVivienda.R5]: 0
            },
            sostenible: {
                [RangosDeVivienda.R1]: 33700,
                [RangosDeVivienda.R2]: 29100,
                [RangosDeVivienda.R3]: 27200,
                [RangosDeVivienda.R4]: 14100,
                [RangosDeVivienda.R5]: 0
            }
        };

        const tipo = tipoDeVivienda === TipoDeVivienda.Tradicional ? 'tradicional' : 'sostenible';
        return valoresBBP[tipo][this.rango];
    }
    private _valorDelBono: number;

    private aplicaIntegrado(): boolean{
        return this.ingresos <= 4746 || this.adultoMayor || this.personaDesplazada || this.migrantesRetornados || this.personaConDiscapacidad;
    }

    public constructor(valorVivienda: number, tipoDeVivienda: TipoDeVivienda, ingresos: number, adultoMayor: boolean, personaDesplazada: boolean, migrantesRetornados: boolean, personaConDiscapacidad: boolean) {
        this.valorVivienda = valorVivienda;
        this.tipoDeVivienda = tipoDeVivienda;
        this.ingresos = ingresos;
        this.adultoMayor = adultoMayor;
        this.personaDesplazada = personaDesplazada;
        this.migrantesRetornados = migrantesRetornados;
        this.personaConDiscapacidad = personaConDiscapacidad;

        this.rango = this.calcularRango();
        this._valorDelBono = this.valorDelBono(this.tipoDeVivienda);


        console.log('[BBPCalc] Inicializando cálculo de BBP:', {
            valorVivienda: this.valorVivienda,
            tipoDeVivienda: TipoDeVivienda[this.tipoDeVivienda],
            ingresos: this.ingresos
        });
    }

    public CalculoDeBono(): number {
        let bono = this._valorDelBono;
        console.log('[BBPCalc] Valor del Bono antes de integrado:', bono);
        if (this.aplicaIntegrado() && this.rango!==RangosDeVivienda.R5) {
            bono += 3600;
        }
        return bono;
    }



}