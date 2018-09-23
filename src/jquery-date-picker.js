/**
 * 基于jQuery的日期选择器
 */
$.fn.datePicker = function () {
    /**
     * 日历自增id
     */
    var idIndex = 0;

    /**
     * 默认配置
     */
    var defaultOptions = {
        id: null,
        bindTrigger: null,
        date: null
    };

    /**
     * 公用函数
     */
    var Util = {
        /**
         * 转换月为汉字
         * @param number month 月
         * @return string 一月,十二
         */
        convertMonth: function (month) {
            var months = '一,二,三,四,五,六,七,八,九,十,十一,十二'.split(',');
            return month > 10
                ? months[month - 1]
                : months[month - 1] + '月';
        },

        /**
         * 是否为闰年
         * @param number year 年
         * @return number 0,1
         */
        isLeapYear: function (year) {
            return (year % 100 == 0 ? res = (year % 400 == 0 ? 1 : 0) : res = (year % 4 == 0 ? 1 : 0));
        },

        /**
         * 获取某月的天数
         * @param object d
         * @return number 28,29,30,31
         */
        getMonthDay: function (d) {
            var days = [31, 28 + this.isLeapYear(d.year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return days[d.month - 1];
        },

        /**
         * 获取某日是礼拜几
         * @param object d
         * @return number 0123456
         */
        getMonthWeek: function (year, month, date) {
            date = date || 1;
            return (new Date(year + '-' + month + '-' + date)).getDay();
        },

        /**
         * 获取格式化的日期
         * @param object d
         * @return string
         */
        getFormatDate: function (d) {
            return d.year + '-' + d.month + '-' + d.date;
        }

    }

    /**
     * 日历类
     */
    var Calendar = function(options) {
        this.id = options.id;
        this.left = options.left;
        this.top = options.top;
        this.date = options.date;
        this.eventSetValue = options.eventSetValue;
        var date = this.date ? new Date(this.date.replace(/[\.-]/g, '/')) : new Date();

        /**
         * 当前显示的数据信息
         */
        this.active = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            yearPage: 0,
        };

        /**
         * 当前选择的数据信息
         */
        this.choose = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate()
        };

        /**
         * 事件
         */
        this.events = {
            'prev-year': function () {
                this.prevYear();
                this.reRender();
            },
            'prev-month': function () {
                this.prevMonth();
                this.reRender();
            },
            'next-month': function () {
                this.nextMonth();
                this.reRender();
            },
            'next-year': function () {
                this.nextYear();
                this.reRender();
            },
            'year-input': function (ele) {
                var chosenYear = $(ele).val();
                this.$yearList.html(this.getYearListHtml(chosenYear, this.active.year)).show();
                this.$monthList.hide();
            },
            'month-input': function () {
                this.$calendar.find('.month-list').show();
                this.$yearList.hide();
            },
            'prev-page-year': function () {
                this.active.yearPage--;
                this.$yearList.html(this.getYearListHtml(this.active.year + this.active.yearPage * 12, this.active.year));
            },
            'next-page-year': function () {
                this.active.yearPage++;
                this.$yearList.html(this.getYearListHtml(this.active.year + this.active.yearPage * 12, this.active.year));
            },
            'year': function (ele) {
                this.choose.year = this.active.year = parseInt($(ele).text());
                this.active.yearPage = 0;
                this.$yearList.hide();
                this.reRender();
            },
            'month': function (ele) {
                this.choose.year = this.active.year;
                this.choose.month = this.active.month = parseInt($(ele).data('month'));
                this.$monthList.hide();
                this.reRender();
            },
            'day': function (ele) {
                var d = $(ele).data('date');
                var date = d.split('-');
                this.choose.year = this.active.year = parseInt(date[0]);
                this.choose.month = this.active.month = parseInt(date[1]);
                this.choose.date = this.active.date = parseInt(date[2]);
                
                this.eventSetValue(d);
                this.$calendar.hide();
                this.reRender();
            },
            'clear': function () {
                var o = new Date();
                this.choose.year = this.active.year = o.getFullYear();
                this.choose.month = this.active.month = o.getMonth() + 1;
                this.choose.date = this.active.date = o.getDate();
                this.eventSetValue('');
                this.$calendar.hide();
                this.reRender();
            },
            'today': function () {
                var o = new Date();
                this.choose.year = this.active.year = o.getFullYear();
                this.choose.month = this.active.month = o.getMonth() + 1;
                this.choose.date = this.active.date = o.getDate();
                this.eventSetValue(Util.getFormatDate(this.active));
                this.$calendar.hide();
                this.reRender();
            },
            'confirm': function () {
                this.choose.year = this.active.year;
                this.choose.month = this.active.month;
                this.choose.date = this.active.date;
                this.eventSetValue(Util.getFormatDate(this.active));
                this.$calendar.hide();
                this.reRender();
            },
        };

        this.$calendar = null;
        this.$header = null;
        this.$yearList = null;
        this.$yearInput = null;
        this.$monthList = null;
        this.$monthInput = null;
        this.$days = null;
    };

    /**
     * 日历模版
     */
    Calendar.prototype.getTemplate = function() {
        return (function(){/*
            <div class="header">
                <div data-action="prev-year" class="prev-year" title="上一年"></div>
                <div data-action="prev-month" class="prev-month" title="上月"></div>
                <div class="chosen-year">
                    <input data-action="year-input" type="text" class="year" title="点击切换年">
                    <ul data-action="year-list" class="year-list clearfix"></ul>
                </div>
                <div class="chosen-month">
                    <input data-action="month-input" type="text" class="month" title="点击切换月">
                    <ul data-action="month-list" class="month-list clearfix"></ul>
                </div>
                <div data-action="next-month" class="next-month" title="下月"></div>
                <div data-action="next-year" class="next-year" title="下一年"></div>
            </div>
            <div class="content">
                <table>
                    <thead>
                        <tr class="week">
                            <td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td>
                        </tr>
                    </thead>
                    <tbody class="days"></tbody>
                </table>
            </div>
            <div class="footer">
                <button class="button" data-action="clear">清空</button>
                <button class="button" data-action="today">今天</button>
                <button class="button" data-action="confirm">确定</button>
            </div>
        */}).toString().split("\n").slice(1, -1).join("\n");
    };

    /**
     * 渲染
     */
    Calendar.prototype.render = function() {
        var calendar = this.create();
        var active = this.active;
        this.$calendar = $(calendar);
        this.$days = this.$calendar.find('.days');
        this.$header = this.$calendar.find('.header');
        this.$yearList = this.$header.find('.year-list');
        this.$monthList = this.$header.find('.month-list');
        this.$yearInput = this.$header.find('.chosen-year .year');
        this.$monthInput = this.$header.find('.chosen-month .month');

        this.$yearList.html(this.getYearListHtml(active.year, active.year));
        this.$yearInput.val(active.year);
        this.$monthList.html(this.getMonthListHtml(active.month));
        this.$monthInput.val(Util.convertMonth(active.month));
        this.$days.html(this.getDayListHtml(active));

        this.$calendar.appendTo(document.body);
        this.bindEvent();
    };

    /**
     * 创建
     */
    Calendar.prototype.create = function() {
        var div = document.createElement('div');
        div.className = 'date-picker-calendar';
        div.id = this.id;
        div.innerHTML = this.getTemplate();
        div.style.position = 'absolute';
        div.style.left = this.left + 'px';
        div.style.top = this.top + 'px';
        return div;
    };

    /**
     * 获取年份列表的html
     * @param number pageYear 当前页年
     * @param number currentYear 当前选择的年
     * @return string
     */
    Calendar.prototype.getYearListHtml = function (pageYear, currentYear) {
        pageYear = parseInt(pageYear);
        currentYear = parseInt(currentYear);
        var html = '';
        for (var i = 0; i < 6; i++) {
            html += '<li data-action="year" class="item' + (currentYear == i + pageYear - 6 ? ' item-active' : '') + '">' + (i + pageYear - 6) + '</li>\n';
            html += '<li data-action="year" class="item' + (currentYear == i + pageYear ? ' item-active' : '') + '">' + (i + pageYear) + '</li>\n';
        }
        html += '<li>\
            <button data-action="prev-page-year" class="pull-left" ><</button>\
            <button data-action="next-page-year" class="pull-right">></button>\
        </li>';
        return html;
    };

    /**
     * 获取月份列表的html
     * @return string
     */
    Calendar.prototype.getMonthListHtml = function (currentMonth) {
        var html = '';
        for (var i = 1; i <= 6; i++) {
            html += '<li data-action="month" data-month="' + i + '" class="item' + (currentMonth == i ? ' item-active' : '') + '">' + Util.convertMonth(i) + '</li>';
            html += '<li data-action="month" data-month="' + (i + 6) + '" class="item' + (currentMonth == i + 6 ? ' item-active' : '') + '">' + Util.convertMonth(i + 6) + '</li>';
        }
        return html;
    };

    /**
     * 获取日列表的html
     * @param object d 日期数据
     * @return string
     */
    Calendar.prototype.getDayListHtml = function (d) {
        var days = this.getDayList();
        
        var html = '';
        for (var i in days) {
            var className = [];
            var date = days[i].year + '-' + days[i].month + '-' + days[i].date;
            var week = Util.getMonthWeek(days[i].year, days[i].month, days[i].date);
            
            if (i % 7 == 0) {
                html += '<tr>';
            }
            if (days[i].type === -1) {
                className.push('ui-prev-month');
            } else if (days[i].type === 1) {
                className.push('ui-next-month');
            }
            if (week == 0 || week == 6) {
                className.push('ui-weekend');
            }
            if (days[i].year == d.year && days[i].month == d.month && days[i].date == d.date) {
                className.push('ui-active');
            }

            if (className.length) {
                html += '<td title='+date+' data-date="' + date + '" data-action="day" class="' + className.join(' ') + '">' + days[i].date + '</td>';
            } else {
                html += '<td title='+date+' data-date="' + date + '" data-action="day">' + days[i].date + '</td>';
            }
            if (i % 7 == 6) {
                html += '</tr>';
            }
        }
        return html;
    };

    /**
     * 获取日列表数据
     * @return array
     */
    Calendar.prototype.getDayList = function () {
        var active = this.active;
        var days = [];
        var monthWeek = Util.getMonthWeek(active.year, active.month);
        var len = 0;
        this.prevMonth();
        var prevMonthDay = Util.getMonthDay(active);
        for (var i = 0; i < monthWeek; i++) {
            days.push({
                type: -1,
                year: active.year,
                month: active.month,
                date: prevMonthDay - monthWeek + i + 1,
            });
        }

        this.nextMonth();
        len = Util.getMonthDay(active)
        for (var i = 1; i <= len; i++) {
            days.push({
                type: 0,
                year: active.year,
                month: active.month,
                date: i
            });
        }

        this.nextMonth();
        len = 42 - days.length
        for (var i = 1; i <= len; i++) {
            days.push({
                type: 1,
                year: active.year,
                month: active.month,
                date: i
            });
        }
        this.prevMonth();
        return days;
    };

    /**
     * 置为上一年
     */
    Calendar.prototype.prevYear = function () {
        this.active.year--;
    };

    /**
     * 置为下一年
     */
    Calendar.prototype.nextYear = function () {
        this.active.year++;
    };

    /**
     * 置为上一月
     */
    Calendar.prototype.prevMonth = function () {
        if (this.active.month == 1) {
            this.prevYear();
            this.active.month = 12;
        } else {
            this.active.month--;
        }
    };

    /**
     * 置为下一月
     */
    Calendar.prototype.nextMonth = function () {
        if (this.active.month == 12) {
            this.nextYear();
            this.active.month = 1;
        } else {
            this.active.month++;
        }
    };

    /**
     * 重新渲染日历
     */
    Calendar.prototype.reRender = function (d) {
        d = d || this.active;
        this.$yearList.html(this.getYearListHtml(d.year, d.year));
        this.$yearInput.val(d.year);
        this.$monthList.html(this.getMonthListHtml(d.month));
        this.$monthInput.val(Util.convertMonth(d.month));
        this.$days.html(this.getDayListHtml(d));
    };

    /**
     * 绑定事件
     */
    Calendar.prototype.bindEvent = function () {
        var $calendar = this.$calendar;
        var self = this;
        $calendar.on('click', function (event) {
            event.stopPropagation();
            var action = $(event.target).data('action');
            if (action in self.events) {
                self.events[action].call(self, event.target);
            }
        });
    };

    return function (options) {
        $.each(this, function () {
            var self = this;
            var opt = $.extend({}, defaultOptions, options);
            opt.bindTrigger = opt.bindTrigger || self;
            opt.id = opt.id || 'calendar-' + idIndex++;
            if (opt.date) {
                self.value = opt.date;
            }
            var calendar = new Calendar({
                id: opt.id,
                left: self.offsetLeft,
                top: self.offsetTop + self.offsetHeight,
                date: self.value,
                eventSetValue: function (value) {
                    self.value = value;
                }
            });
            $(opt.bindTrigger).on('click', function (event) {
                event.stopPropagation();
                if (calendar.$calendar) {
                    calendar.reRender(calendar.choose);
                    calendar.$calendar.show();
                } else {
                    calendar.render();
                }
            });
            $(window).on('click', function (event) {
                if (calendar.$calendar) {
                    calendar.active.yearPage = 0;
                    calendar.$calendar.hide();
                }
            });
        });
    };
}();
