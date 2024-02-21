import { TableScraper } from './_baseTable'

class Tbl3PartneredNoOasScraper extends TableScraper {
  constructor() {
    super({
      outputFileName: 'tbl3_partneredNoOas',
      numIterations: 54,
    })
  }

  tableUrl(pageNo: number): string {
    return `https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/payments/tab3-${pageNo}.html`;
  }
}

export default Tbl3PartneredNoOasScraper
