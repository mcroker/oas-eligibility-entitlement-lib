import { OutputItemGeneric, TableScraper } from './_baseTable'

class Tbl5PartneredAfsScraper extends TableScraper {
  constructor() {
    super({
      outputFileName: 'tbl5_partneredAfs',
      numIterations: 58,
    })
  }

  tableUrl(pageNo: number): string {
    return `https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/payments/tab5-${pageNo}.html`;
  }

  override dataExtractor(row: Element): OutputItemAfs {
    const orig = super.dataExtractor(row)
    const afs = this.getCellValue(row, 1)
    if (afs === undefined) {
      throw new Error('Cannot parse cell value for afs');
    }
    return { range: orig.range, afs }
  }
}

export interface OutputItemAfs extends OutputItemGeneric {
  afs: number
}

export default Tbl5PartneredAfsScraper
