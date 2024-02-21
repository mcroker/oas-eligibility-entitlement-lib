import { TableScraper } from './_baseTable'

class Tbl1SingleScraper extends TableScraper {
  constructor() {
    super({
      outputFileName: 'tbl1_single',
      numIterations: 54
    })
  }

  tableUrl(pageNo: number): string {
    return `https://www.canada.ca/en/services/benefits/publicpensions/cpp/old-age-security/payments/tab1-${pageNo}.html`;
  }
}

export default Tbl1SingleScraper
