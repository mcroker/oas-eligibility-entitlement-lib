import { TableScraper } from './_baseTable'

class Tbl2PartneredAndOasScraper extends TableScraper {
  constructor() {
    super({
      outputFileName: 'tbl2_partneredAndOas',
      numIterations: 33,
    })
  }

  tableUrl(pageNo: number): string {
    return `https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/payments/tab2-${pageNo}.html`;
  }
}

export default Tbl2PartneredAndOasScraper
