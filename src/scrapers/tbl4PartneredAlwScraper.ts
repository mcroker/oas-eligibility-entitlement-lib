import { OutputItemGeneric, OutputItemGis, TableScraper } from './_baseTable'

class Tbl4PartneredAlwScraper extends TableScraper {
  constructor() {
    super({
      outputFileName: 'tbl4_partneredAlw',
      numIterations: 45
    });
  }

  tableUrl(pageNo: number): string {
    return `https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/payments/tab4-${pageNo}.html`;
  }

  getAlw(row: Element): number {
    const alwStr = row.children[3].textContent
    if (alwStr === null) {
      throw new Error('getAlw: Element children[3] missing');
    }
    const alwStrStripped = alwStr.replace(/\$\s?|(,*)/g, '')
    return parseFloat(alwStrStripped)
  }

  override dataExtractor(row: Element): OutputItemAlw {
    const orig = super.dataExtractor(row) as OutputItemGis
    const alw = this.getAlw(row)
    return {
      range: orig.range,
      gis: orig.gis,
      alw,
      combinedOasGis: orig.combinedOasGis,
    }
  }
}

export interface OutputItemAlw extends OutputItemGeneric {
  gis: number
  alw: number
  combinedOasGis: number
}

export default Tbl4PartneredAlwScraper
