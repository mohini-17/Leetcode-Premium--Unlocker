import { ProblemTableElementModifier } from "../ElementModifier/ProblemTableElementModifier";
import { generateInnerProgressbar } from "../ElementGenerator/ElementHelperClass";
import { GoogleSheetsProblemFrequencyDataFetcher } from "../DataFetcher/GoogleSheetsDataFetcher";
import { CSSStyler } from "../Objects";

class ProblemFrequncyUnlocker{ 
    constructor() { 
        this.elementModifier =  new ProblemTableElementModifier()
        this.dataFetcher = new GoogleSheetsProblemFrequencyDataFetcher()
    }

    onFetchSuccess() {
        this.elementModifier.injectFunctionToTargetElement(ProblemFrequncyUnlocker.removeProgressbarUnlockButton)
        this.elementModifier.injectFunctionToTargetElement(this.insertInnerProgressbar)
        this.elementModifier.injectFunctionToTargetElement(this.removePremiumLockLogo)
        this.elementModifier.modifyElement()
    }

    unlock() { 
        this.dataFetcher.fetchData()
        .then(data => {this.problemData = data})
        .then(this.onFetchSuccess.bind(this))
        .catch(e => (console.log(this, e)))
        this.dataFetcher.fetchProblem("2")
    }

    removePremiumLockLogo = (row) => {
        let isPremium = row.getAttribute("is-premium") == "true"
        if(isPremium){
            let problemId = row.getAttribute("problem-id")
            let problemUrl = row.getElementsByTagName("a")[0] 
            problemUrl.href = "javascript:void(0)"
            problemUrl.style.color = CSSStyler.COLOR_ACCENT; 
            problemUrl.addEventListener('click', () => {
                this.onPremiumProblemClicked(problemId)
            }
            )
        }
    }

    onPremiumProblemClicked = (problemId) => { 
        this.dataFetcher.fetchProblem(parseInt(problemId))
    }

    removeLockLogo(row) { 
        let cells = row.querySelectorAll('[role="cell"]')
        cells[0].getElementsByTagName("svg")[0].remove()
        cells[1].getElementsByTagName("svg")[0].remove()
    }

    insertInnerProgressbar = (row) =>  { 
        let cells = row.querySelectorAll('[role="cell"]')
        let progressBar = cells[cells.length -1]

        let id = row.getAttribute("problem-id")
        let width = this.problemData[id] 
        if(width == undefined) width = 0
        width *= 100

        let innerProgressbarClassName = "inner-progressbar"
        let innerProgressbar = progressBar.getElementsByClassName(innerProgressbarClassName)
        let outerProgressbar = progressBar.getElementsByClassName('rounded-l-lg')[0]
        if(innerProgressbar.length > 0) { innerProgressbar[0].remove()}
        outerProgressbar.setAttribute("title", `${Math.round(width)}%`)
        let progress = generateInnerProgressbar(width)
        progress.classList.add(innerProgressbarClassName)
        outerProgressbar.appendChild(progress)
    }

    static removeProgressbarUnlockButton(row) {
        let cells = row.querySelectorAll('[role="cell"]')
        let progressbar = cells[cells.length -1]

        let lockLogo = progressbar.getElementsByTagName("svg")[0]
        let leftBar = progressbar.getElementsByClassName('rounded-r-lg')[0]
        let rightBar = progressbar.getElementsByClassName('rounded-l-lg')[0]
        if (lockLogo!= undefined) lockLogo.remove(); 
        if (leftBar!= undefined) leftBar.remove()
        if (rightBar != undefined){
            rightBar.style = `
            border-bottom-right-radius: 0.5rem;
            overflow: hidden; 
            border-top-right-radius: 0.5rem
            `
        }
    }

}

export {ProblemFrequncyUnlocker}