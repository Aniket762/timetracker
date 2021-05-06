import { HorizontalBar } from 'vue-chartjs';

export default {
  extends: HorizontalBar,
  methods: {
    getData() {
      const currentDate = new Date().toISOString().substr(0, 10);
      return new Promise((resolve) => {
        chrome.storage.local.get(currentDate, result => {
          return result[currentDate] ? resolve(result[currentDate]) : resolve({});
        });
      });
    }
  },

  async mounted() {
    const currentDate = new Date;
    const data = await this.getData();
    const values = Object.values(data).map(each => (each / 60).toFixed(2));
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: Object.keys(data),
      datasets: [{
        label: `Stats for ${currentDate}`,
        // label: 'Stats for today',
        backgroundColor: '#f87979',
        data: values
      }]
    }, {
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Minutes'
          }
        }],
        yAxes: [{
          barThickness: 'flex'
        }]
      }
    });
  }
};