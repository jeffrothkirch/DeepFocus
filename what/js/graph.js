 window.onload = function() {
                radar_jeff = new Chart(document.getElementById("canvas-jeff"), generate_config());
                radar_julia = new Chart(document.getElementById("canvas-julia"), generate_config());
                radar_anonymous = new Chart(document.getElementById("canvas-anonymous_1"), generate_config());
                
            };

            var randomScalingFactor = function() {
                return Math.round(Math.random() * 100);
            };
            var randomColorFactor = function() {
                return Math.round(Math.random() * 255);
            };
            var randomColor = function(opacity) {
                return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
            };

            var generate_config = function() {
                var config = {
                    type: 'radar',
                    data: {
                        labels: ["Anger", "Disgust", "Fear", "Joy", "Sadness"],
                        datasets: [{
                            backgroundColor: "rgba(0,0,0,0.4)",
                            pointBackgroundColor: "rgba(0,0,0,1)",
                            data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()]
                        }]
                    },
                    options: {
                        title: {
                            display: false,
                            fontColor: '#000',
                            fontFamily: 'Helvetica Neue',
                            defaultFontStyle : 12,
                            text: 'Emotion Summary'
                        },
                        scaleShowLabels : false,
                        legend: {
                            display: false,
                            position: 'top',
                        },
                        scale: {
                          reverse: false,
                          ticks: {
                            beginAtZero: true,
                            display: false,
                        }
                    }
                }
            };
            return config;
        }

        $('#randomizeData').click(function() {
            $.each(config.data.datasets, function(i, dataset) {
                dataset.data = dataset.data.map(function() {
                    return randomScalingFactor();
                });

            });

            window.myRadar.update();
        });

        $('#addDataset').click(function() {
            var newDataset = {
                label: 'Dataset ' + config.data.datasets.length,
                borderColor: randomColor(0.4),
                backgroundColor: randomColor(0.5),
                pointBorderColor: randomColor(0.7),
                pointBackgroundColor: randomColor(0.5),
                pointBorderWidth: 1,
                data: [],
            };

            for (var index = 0; index < config.data.labels.length; ++index) {
                newDataset.data.push(randomScalingFactor());
            }

            config.data.datasets.push(newDataset);
            window.myRadar.update();
        });

        $('#addData').click(function() {
            if (config.data.datasets.length > 0) {
                config.data.labels.push('dataset #' + config.data.labels.length);

                $.each(config.data.datasets, function (i, dataset) {
                    dataset.data.push(randomScalingFactor());
                });

                window.myRadar.update();
            }
        });

        $('#removeDataset').click(function() {
            config.data.datasets.splice(0, 1);
            window.myRadar.update();
        });

        $('#removeData').click(function() {
        config.data.labels.pop(); // remove the label first

        $.each(config.data.datasets, function(i, dataset) {
            dataset.data.pop();
        });

        window.myRadar.update();
    });