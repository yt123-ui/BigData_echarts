window.onload = function() {
    let data = {};
    var wsServer = 'ws://121.199.39.16:9503?sid=1';
    var websocket = new WebSocket(wsServer);
    //连接webSocket服务
    websocket.onopen = function(evt) {
        console.log("Connected to WebSocket server.");
        // websocket.send(1); //发送数据
    };
    
    //接收消息
    websocket.onmessage = function(evt) {
        data = JSON.parse(evt.data).data;
        dataRender(data);
        fontSize();
        initData(data);
    };
    //抛出错误
    websocket.onerror = function(evt, e) {
        console.log('Error occured: ' + evt.data);
    };
    //标题日期渲染
    function currentTime(data) {
        return data.totalAmount.date + '商品销量top5';
    }
    //数据渲染
    function dataRender(data) {
        let str = '';
        let nowDate = document.querySelector('.top>.title');
        let totalnum = document.querySelector('#totalnum');
        let nowOrder = document.querySelector('.bottom>.title');
        let ordernum = document.querySelector('#ordernum');
        let list = document.querySelector('tbody');
        let header = document.querySelector('#header .box p');
        let headerEligsh = document.querySelector('#header .box span');
        let orderList = [];
        headerEligsh.innerHTML = 'Huoguili Mall real-time order'
        header.innerHTML = '货柜里商城实时订单';
        if (data.totalAmount.money == null) {
            totalnum.innerHTML = `0`;
            ordernum.innerHTML = `0`;
        } else {
            animate.startNum = data.totalAmount.money;
            animate1.startNum = data.orderNum.number;
            animate.init(animate.time)
            animate1.init(animate1.time)
        }
        nowDate.innerHTML = `${data.totalAmount.date}交易总额（元）`;
        nowOrder.innerHTML = `${data.orderNum.date}订单笔数（笔）`;
        orderList = data.orderList;
        if (orderList.length > 7) {
            orderList.length = 7;
        }
        orderList.forEach((item, index) => {
            if (index == 0) {
                str += `<tr class="myanimate">
                <td>${item.cd}</td>
                <td>${item.goodsName}</td>
                <td>${item.price_order}</td>
                <td>${item.userName}</td>
                <td>${item.mobile}</td>
            </tr>`
            } else {
                str += `<tr>
                <td>${item.cd}</td>
                <td>${item.goodsName}</td>
                <td>${item.price_order}</td>
                <td>${item.userName}</td>
                <td>${item.mobile}</td>
            </tr>`
            }
        })
        list.innerHTML = str;
    }
    //初始化数据函数
    function initData(data) {
        fontSize();
        leftData(data);
        rightData(data);
    }
    //根据屏幕宽度大小实现自适应字体和距离调节
    function nowWidthSize(val) {
        let nowClientWidth = document.documentElement.clientWidth;
        return val * (nowClientWidth / 1920);
    }
    //根据屏幕高度大小实现自适应字体和距离调节
    function nowHeightSize(val) {
        let nowClientHeight = document.documentElement.clientHeight;
        return val * (nowClientHeight / 1080);
    }
    //解决饼图数据太小导致显示扇形区域面积过小的问题
    function pieData(data) {
        let showData = [];
        window.totalVal = 0;
        let maxVal = 0;
        if (data.goodsTop == null) {
            data.goodsTop = [];
        }
        data.goodsTop.forEach((item) => {
            totalVal += Number(item.money);
            if (Number(item.money) >= maxVal) maxVal = Number(item.money);
        });
        window.showMore = Math.round(maxVal * 0.2);
        data.goodsTop.forEach(item => {
            if (item.name.length > 6) {
                let str = item.name.substring(0, 6)
                showData.push({ value: parseFloat(item.money) + showMore, name: str + '...', percent: item.percent })
            } else {
                showData.push({ value: parseFloat(item.money) + showMore, name: item.name, percent: item.percent })
            }
        })
        return showData;
    }
    //柱状图数据处理
    function barData(data, type) {
        let newData = [];
        let showData = [];
        if (data.classTop == null) {
            data.classTop = [];
        }
        newData = data.classTop.sort(function(a, b) { return b.money - a.money });
        if (type == 'data') {
            newData.forEach(item => {
                showData.push(item.money);
            })
        } else {
            newData.forEach(item => {
                showData.push(item.name);
            })
        }
        return showData
    }
    //饼状图配置设置
    function leftData(data) {
        const option = {
            title: {
                text: currentTime(data),
                left: 'left',
                textStyle: {
                    fontSize: nowWidthSize(24),
                    color: '#00FFFC',
                    fontWeight: '400',
                    fontFamily: 'Microsoft Yahei',
                },
                padding: [nowHeightSize(16), 0, 0, nowWidthSize(29)]
            },
            series: [{
                    type: 'pie',
                    radius: ['30%', '80%'],
                    center: ['50%', '50%'],
                    roseType: 'radius',
                    top: nowWidthSize(44),
                    minAngle: 35,
                    hoverOffset: false,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'inner',
                                formatter: function(item) {
                                    return item.data.percent + '%';
                                },
                                color: '#fff',
                                fontSize: nowWidthSize(16),
                                fontFamily: ' Microsoft YaHei Regular, Microsoft YaHei Regular-Regular',
                            },
                            color: function(params) {
                                let colorList = [
                                    '#0282DE', '#FED701', '#67E0E3', '#FFA0A0', '#FE9B1A'
                                ];
                                return colorList[params.dataIndex]
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            }
                        }
                    },
                    data: pieData(data).sort(function(a, b) { return b.value - a.value })
                },
                {
                    type: 'pie',
                    radius: ['30%', '80%'],
                    center: ['50%', '50%'],
                    roseType: 'radius',
                    top: nowWidthSize(44),
                    minAngle: 35,
                    hoverOffset: false,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'outside',
                                formatter: function(item) {
                                    if (item.data.value - showMore > 10000) {
                                        return `${item.data.name}\n￥${((item.data.value - showMore)/10000).toFixed(2)}万`
                                    } else {
                                        return `${item.data.name}\n￥${(item.data.value - showMore).toFixed(2)}`
                                    }

                                },
                                fontSize: nowWidthSize(20),
                                fontWeight: 700,
                                color: '#81DDFF',
                                lineHeight: nowHeightSize(28),
                                padding: [0, nowWidthSize(-120)]
                            },
                            color: function(params) {
                                let colorList = [
                                    '#0282DE', '#FED701', '#67E0E3', '#FFA0A0', '#FE9B1A'
                                ];
                                return colorList[params.dataIndex]
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: true,
                            lineStyle: {
                                color: '#aaa',
                                width: nowWidthSize(1),
                            },
                            // length: 5,
                            length2: nowWidthSize(120)
                        }
                    },
                    data: pieData(data).sort(function(a, b) { return b.value - a.value })
                }
            ],
        };
        //初始化echarts实例
        window.myChart1 = echarts.init(document.getElementById('left'));
        //使用制定的配置项和数据显示图表
        myChart1.setOption(option);
    }
    //柱状图配置设置
    function rightData(data) {
        option = {
            title: {
                text: currentTime(data),
                left: 'left',
                textStyle: {
                    fontSize: nowWidthSize(24),
                    color: '#00FFFC',
                    fontWeight: '400',
                    fontFamily: 'Microsoft YaHei Regular-Regular',
                },
                padding: [nowHeightSize(16), 0, 0, nowWidthSize(28)]
            },
            grid: {
                right: nowWidthSize(21),
                top: nowHeightSize(90),
                bottom: nowHeightSize(60),
                left: nowHeightSize(80)
            },
            xAxis: {
                type: 'category',
                axisLabel: {
                    textStyle: {
                        color: '#81DDFF',
                        fontSize: nowWidthSize(20),
                        fontWeight: 400
                    },
                    margin: nowHeightSize(14),
                    interval: 0,
                    formatter: function(value) {
                        let ret = ""; //拼接加\n返回的类目项  
                        let maxLength = 4; //每项显示文字个数  
                        let valLength = value.length; //X轴类目项的文字个数  
                        let rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数  
                        if (rowN > 1) //如果类目项的文字大于3,  
                        {
                            for (let i = 0; i < rowN; i++) {
                                let temp = ""; //每次截取的字符串  
                                let start = i * maxLength; //开始截取的位置  
                                let end = start + maxLength; //结束截取的位置  
                                //这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧  
                                temp = value.substring(start, end) + "\n";
                                ret += temp; //凭借最终的字符串  
                            }
                            return ret;
                        } else {
                            return value;
                        }
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#6076AD',
                        width: nowHeightSize(1)
                    }
                },
                axisTick: false,
                data: barData(data, 'name')
            },
            yAxis: {
                type: 'value',
                splitNumber: 10,
                axisLabel: {
                    textStyle: {
                        color: '#B2D2ED',
                        fontSize: nowWidthSize(16),
                        fontFamily: 'Arial Regular-Regular',
                    },
                    formatter: function(value) {
                        return value
                    },
                },
                axisLine: {
                    show: false,
                },
                axisTick: false,
                splitLine: {
                    lineStyle: {
                        color: '#142242',
                        width: nowWidthSize(1),
                        fontFamily: 'Arial Regular-Regular',
                    }
                }
            },
            series: [{
                data: barData(data, 'data'),
                type: 'bar',
                barWidth: nowWidthSize(50),
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            position: 'top',
                            textStyle: {
                                color: '#0EFCFF',
                                fontSize: nowWidthSize(18),
                                fontWeight: 700,
                            },
                            formatter: function(value) {
                                if (value.data > 10000) {
                                    return `￥${(value.data/10000).toFixed(2)}万`
                                } else {
                                    return '￥' + value.data
                                }

                            }
                        },
                        color: function(params) {
                            let colorList = [
                                ['#3F28D0', '#0282DE'],
                                ['#FC9501', '#FED701'],
                                ['#0181DE', '#67E0E3'],
                                ['#FF7E7E', '#FFA0A0'],
                                ['#FE411B', '#FE9B1A']
                            ];
                            let colorItem = colorList[params.dataIndex];
                            return new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                                    offset: 0,
                                    color: colorItem[0]
                                },
                                {
                                    offset: 1,
                                    color: colorItem[1]
                                }
                            ], false);
                        }
                    },
                },
            }]
        };
        window.myChart2 = echarts.init(document.getElementById('right'));
        //使用制定的配置项和数据显示图表
        myChart2.setOption(option);
    }
    //字体根据屏幕自适应布局
    function fontSize() {
        let title = document.getElementsByClassName('title');
        let totalNum = document.querySelector('#totalnum');
        let orderNum = document.querySelector('#ordernum');
        let tip = document.querySelector('.tip');
        let thead = document.querySelector('thead');
        let tbody = document.querySelector('tbody');
        let header = document.querySelector('#header .box p');
        let headerEligsh = document.querySelector('#header .box span');
        for (let i = 0; i < title.length; i++) {
            title[i].style.fontSize = nowWidthSize(25) + 'px';
        }
        headerEligsh.style.fontSize = nowWidthSize(14) + 'px';
        header.style.fontSize = nowWidthSize(38) + 'px';
        totalNum.style.fontSize = nowWidthSize(60) + 'px';
        orderNum.style.fontSize = nowWidthSize(60) + 'px';
        tip.style.fontSize = nowWidthSize(24) + 'px';
        thead.style.fontSize = nowWidthSize(24) + 'px';
        tbody.style.fontSize = nowWidthSize(20) + 'px';
    }
    //echarts和字体实现响应式布局
    window.addEventListener("resize", () => {
        if (parseFloat(animate.startNum) > 0) {
            animate.init(animate.time)
            animate1.init(animate1.time)
        }
        initData(data);
        this.myChart1.resize();
        this.myChart2.resize();
    });
    //数据变化动画
    class animateObj {
        constructor(id, startNum, time) {
                this.id = id //容器唯一标识
                this.startNum = startNum // 初始数值
                this.savePositionArr = [] //存放旧数据的位置数组
                this.time = time; // 转动速度设置
            }
            // 数字转成数组
        number2Arr(digit) {
                var num_arr = [];
                for (var i = 0; i < digit.length; i++) {
                    num_arr.push(digit.charAt(i));
                }
                return num_arr;
            }
            // dom构建
        amtDom(arr) {
                var str = '';
                for (var i = 0; i < arr.length; i++) {
                    if (parseInt(arr[i]) >= 0) {
                        str += '<div class="scrollItem digit-container" data-show=' + arr[i] + '>\
                        <span>0</span>\
                        <span>1</span>\
                        <span>2</span>\
                        <span>3</span>\
                        <span>4</span>\
                        <span>5</span>\
                        <span>6</span>\
                        <span>7</span>\
                        <span>8</span>\
                        <span>9</span>\
                    </div>';
                    } else {
                        str += '<div class="sign-box"><span>' + arr[i] + '</span></div>';
                    }
                }
                return str + '<span class="trend"><span>';
            }
            // 动画事件
        animation(time) {
                const _this = this;
                var height = parseInt(window.getComputedStyle(document.getElementById(`${this.id}`)).height);
                $(".scrollItem").each(function(i) {
                    let scrollTopOld, scrollTopNew;
                    let num = parseInt($(this).data("show"));
                    scrollTopNew = height * num;
                    if (!_this.savePositionArr[i]) {
                        _this.savePositionArr[i] = 0
                    }
                    scrollTopOld = _this.savePositionArr[i]
                    $(this).css("margin-top", -scrollTopOld);
                    if (scrollTopOld != scrollTopNew) {
                        $(this).animate({ marginTop: -scrollTopNew }, time);
                    }
                    _this.savePositionArr[i] = scrollTopNew
                });
            }
            // 数据初始化
        init(time) {
            const _sNum = this.startNum + '';
            const numArr = this.number2Arr(_sNum);
            $("#" + this.id).html(this.amtDom(numArr));
            this.animation(time);
        }
    }
    fontSize();
    let animate = new animateObj('totalnum', 0, 1500);
    let animate1 = new animateObj('ordernum', 0, 1500);
}