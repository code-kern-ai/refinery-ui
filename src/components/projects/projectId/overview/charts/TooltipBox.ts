export class TooltipBox {

    public static buildAbsoluteHtml(elementData): string {
        return `<span style="font-family: \'DM Sans\', sans-serif;">
          <div class="flex flex-col items-center">
            <div class="font-bold">`+ elementData.key + `</div> 
            <div style="display: grid;grid-template-columns: max-content max-content;">
              <div class="font-bold">relative</div>
              <div>`+ Math.round(elementData.value * 100) / 100 + `%</div>
              <div class="font-bold">absolute</div>
              <div>`+ elementData.absolute / 100 + `</div>
            </div>
          </div>
        </span>
        `
    }
}