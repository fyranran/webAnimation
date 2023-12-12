function startRoll() {
    // 获取所有骰子元素和结果显示元素
    var diceElements = document.querySelectorAll('.dice');
    var dotImages = document.querySelectorAll('.dot');
    var resultElement = document.getElementById('result');

    // 清空之前的结果
    resultElement.textContent = "";

    // 移除之前的动画样式
    diceElements.forEach(function (dice) {
        dice.style.animation = 'none';
    });

    // 添加新的动画样式
    diceElements.forEach(function (dice) {
        dice.style.animation = 'roll 2s ease-in-out';
    });

    // 2秒后停止动画
    setTimeout(function() {
        // 移除所有骰子的动画样式
        diceElements.forEach(function (dice) {
            dice.style.animation = 'none';
        });

        // 为每个骰子随机选择图片
        dotImages.forEach(function (dotImage) {
            var randomNumber = Math.floor(Math.random() * 6) + 1;
            dotImage.src = `dot${randomNumber}.jpg`;
            dotImage.alt = `Dot Image ${randomNumber}`;
        });

        // 计算骰子的和
        var sum = Array.from(dotImages).reduce(function (total, dotImage) {
            // 解析图片的数字
            var number = parseInt(dotImage.alt.split(' ')[2]);
            return total + number;
        }, 0);

        // 显示结果
        resultElement.textContent = `Total Sum: ${sum}`;
    }, 2000);
}
