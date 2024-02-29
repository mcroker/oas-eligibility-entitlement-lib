import { AlwBenefit } from '../benefits/alwBenefit'
import { OasBenefit } from '../benefits/oasBenefit'
import { BenefitResultsObject, MonthYear, isMonthYear } from '../definitions/types'


export function getEligibleBenefits(benefits: BenefitResultsObject) {
  const newObj: BenefitResultsObject = {}
  for (const key in benefits) {
    if (benefits[key]?.eligibility?.result === 'eligible') {
      newObj[key] = benefits[key]
    }
  }
  return Object.keys(newObj).length === 0 ? null : newObj
}

export function getAgeArray(residencyData: {
  client: { age: number; res: number }
  partner: { age: number; res: number }
}) {
  let [userAge, partnerAge] = [
    residencyData.client.age,
    residencyData.partner.age,
  ]
  let [userRes, partnerRes] = [
    residencyData.client.res,
    residencyData.partner.res,
  ]

  // Early return if any element is missing
  if ([userAge, partnerAge, userRes, partnerRes].some((el) => isNaN(el)))
    return []

  //when partner does not have Legal status residenciy is 0
  if (userAge >= 65 && partnerRes === 0) return []

  const result = []

  while (true) {
    let cALW = AlwBenefit.yearsUntilALW(userAge, userRes)
    let cOAS = OasBenefit.yearsUntilOAS(userAge, userRes)
    let pALW = AlwBenefit.yearsUntilALW(partnerAge, partnerRes)
    let pOAS = OasBenefit.yearsUntilOAS(partnerAge, partnerRes)

    let arr = [cALW, cOAS, pALW, pOAS]
    if (arr.every((el) => el === null)) break

    const years = Math.min(...arr.filter((num) => num !== null) as number[])
    userAge += years
    partnerAge += years
    userRes += years
    partnerRes += years
    result.push([userAge, partnerAge])
  }

  return result
}

function addKeyValue(obj: { [key: string | number]: any }, key: string | number, val: any) {
  if (!obj.hasOwnProperty(key)) {
    obj[key] = val
  }
}


export const consoleDev = (...messages: any) => {
  if (process.env.APP_ENV !== 'production') console.log(...messages)
}
