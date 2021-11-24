/* =============================================================================
#     FileName: TimeZone.js
#         Desc: JS时区处理方法   
#      Version: 1.1.3
#   LastChange: 2021-11-24 10:43:58
============================================================================= */
(function(window, undefined){
  var TimeZone = window.TimeZone || {};

  // 默认时间格式
  TimeZone.formatStr = 'YYYY/MM/DD hh:mm:ss';

  // 默认时区, 东8区
  TimeZone.timeZone = -8;

  /**
   * 获取本地时区
   * @return { Number } 时间，东区为负，西区为正
   */
  TimeZone.getTimeZone = function(){
    var currentZoneTime = new Date();
    // 本地时区
    var offsetZone = currentZoneTime.getTimezoneOffset() / 60;

    return offsetZone;
  };

  /**
   * 通过时间戳获取指定时区当天的零点时间戳
   * @param { Number } timestamp, 时间戳，秒
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @return { Number } 时间戳
   */
  TimeZone.getZeroByTimestamp = function(timestamp, timeZone){
    // 转换成毫秒
    timestamp *= 1000;
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }

    return Math.round((Math.floor((timestamp - timeZone * 60 * 60 * 1000)/(24 * 60 * 60 * 1000)) * 24 * 60 * 60 * 1000 + timeZone * 60 * 60 * 1000) / 1000);
  };

  /**
   * 将时间戳转换成指定时区的时间格式
   * @param { Number } timestamp, 时间戳，秒
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @param { String } formatStr, 时间格式 YYYY-MM-DD hh:mm:ss 区分大小写
   * @return { string } 时间格式
   */
  TimeZone.formatTimeStamp = function(timestamp, timeZone, formatStr) {
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }
    // 默认格式
    formatStr = formatStr || TimeZone.formatStr;

    // 特殊处理星期几时间转换
    var utcTimestamp = TimeZone.getZeroByTimestamp(timestamp) - timeZone * 60 * 60;
    // 获取当天星期几，默认星期日为0
    var day = new Date(utcTimestamp * 1000).getUTCDay();

    // 转换成毫秒
    timestamp *= 1000;
    // 取反
    timeZone = -timeZone;
    // 计算时区偏差值
    timestamp += timeZone * 60 * 60 * 1000;

    var d = new Date(timestamp);
    var z = {
      M: d.getUTCMonth() + 1,
      D: d.getUTCDate(),
      d: d.getUTCDate(),
      H: d.getUTCHours(),
      h: d.getUTCHours(),
      m: d.getUTCMinutes(),
      s: d.getUTCSeconds(),
      w: day // 特殊星期几
    };

    // 格式化
    formatStr = formatStr.replace(/(M+|D+|d+|H+|h+|m+|s+|w+)/g, function(v) {
      return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
    });
    formatStr = formatStr.replace(/(Y+|y+)/g, function(v) {
      return d.getUTCFullYear().toString().slice(-v.length);
    });

    return formatStr;
  };

  /**
   * 获取指定时区, 两个时间戳范围每天的零点时间戳
   * @param { Number } startTimestamp, 开始时间戳，秒
   * @param { Number } endTimestamp, 结束时间戳，秒
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @param { String } formatStr, 时间格式 YYYY-MM-DD hh:mm:ss 区分大小写
   * @return { string } 时间格式
   */
  TimeZone.getDaysZeroList = function(startTimestamp, endTimestamp, timeZone, formatStr) {
    // 转换成毫秒
    endTimestamp *= 1000;
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }
    // 默认格式
    formatStr = formatStr || TimeZone.formatStr;

    var daysZeroList = [];
    // 获取指定时间, 0点时间戳
    var startTimestamp = TimeZone.getZeroByTimestamp(startTimestamp, timeZone) * 1000;

    // 以天为步长获取对应的时间戳
    while(startTimestamp <= endTimestamp){
      daysZeroList.push({
        timestamp: Math.round(startTimestamp / 1000),
        timeStr: TimeZone.formatTimeStamp(Math.round(startTimestamp / 1000), timeZone, formatStr)
      });
      startTimestamp += 24 * 60 * 60 * 1000;
    }

    return daysZeroList;
  };

  /**
   * 获取时间戳，指定时间里面的每周开始和结束零点时间戳
   * @param { Number } timestamp, 结束时间戳，秒
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @param { Boolean } isMonday, 星期一是否是一天开始
   * @param { Number } weekNum, 获取的周数
   * @param { String } formatStr, 时间格式 YYYY-MM-DD hh:mm:ss 区分大小写
   * @return { string } 时间格式
   */
  TimeZone.getWeekTimestamp = function(timestamp, timeZone, isMonday, weekNum, formatStr) {
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }
    // 获取零点时间
    timestamp = TimeZone.getZeroByTimestamp(timestamp, timeZone);

    // 周数
    if(typeof weekNum === 'undefined'){
      weekNum = 1;
    }

    // 默认格式
    formatStr = formatStr || TimeZone.formatStr;

    // 时间转换
    var utcTimestamp = timestamp - timeZone * 60 * 60;
    // 获取当天星期几，默认星期日为0
    var day = new Date(utcTimestamp * 1000).getUTCDay();
    var weeks = [];
    var startTimestamp = 0; // 开始时间

    // 如果是从星期一开始
    if(isMonday){
      day = day === 0 ? 7 : day;
      startTimestamp = timestamp - 86400 * (day - 1);
    } else {
      day = day === 0 ? 0 : day;
      startTimestamp = timestamp - 86400 * day;
    }

    for(var i = 0; i < weekNum; i++){
      var tmpStartTimestamp = startTimestamp - 86400 * 7 * i; // 按周递减
      var endTimestamp = tmpStartTimestamp + 86400 * 7 - 1; // 加一周时间
      var item = {
        startTimestamp: tmpStartTimestamp,
        endTimestamp: endTimestamp,
        startTimestampStr: TimeZone.formatTimeStamp(tmpStartTimestamp, timeZone, formatStr),
        endTimestampStr: TimeZone.formatTimeStamp(endTimestamp, timeZone, formatStr)
      }
      weeks.push(item);
    }

    return weeks;
  };

  /**
   * 获取时间戳，时间字符串转指定时区的时间戳
   * @param { String }, 时间字符串， YYYY-MM-DD HH:mm:ss
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @return { Number } 时间戳
   */
  TimeZone.dateStrToUnix = function(dateStr, timeZone) {
    // 处理时间字符
    dateStr = dateStr.replace(/-/g, '/');

    // 获取当地时区
    var localTimeZone = TimeZone.getTimeZone();
    var timestamp = Math.round(new Date(dateStr).getTime() / 1000);

    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }

    // 计算时差，转成秒
    timestamp = timestamp - (localTimeZone - timeZone) * 3600;

    return timestamp;
  };

  /**
   * 获取某一个月的天数
   * @param { String|Number } dateStr, 时间字符串或时间戳， [YYYY-MM-DD HH:mm:ss|时间戳，秒]
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @return { Object } { days: '天数', month:'月', year: '年' }
   */
  TimeZone.getMonthDays = function (dateStr, timeZone) {
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }

    // 获取指定时区时间戳
    var timestamp = dateStr;

    // 字符串时间转时间戳
    if(Object.prototype.toString.call(dateStr) === '[object String]'){
      timestamp = TimeZone.dateStrToUnix(dateStr, timeZone);
    }

    var curDate = new Date(timestamp * 1000);
    var curMonth = curDate.getMonth() + 1;
    var curYear = curDate.getFullYear();
    var days = new Date(curYear, curMonth, 0).getDate();

    // 下一个月的第0天，就是上一个月的最后一天
    return {
      days: days,
      month: curMonth,
      year: curYear
    };
  };

  /**
   * 获取某个月的每一天日期列表
   * @param { String|Number } dateStr, 时间字符串或时间戳， [YYYY-MM-DD HH:mm:ss|时间戳，秒]
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   * @param { String } formatStr, 时间格式 YYYY-MM-DD hh:mm:ss 区分大小写
   * @return { Array } 每一天的日期
   */
  TimeZone.getMonthEveryDays = function(dateStr, timeZone, formatStr) {
    // 默认格式
    formatStr = formatStr || TimeZone.formatStr;
    // 默认时间
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }

    var monthData = TimeZone.getMonthDays(dateStr, timeZone);
    var days = monthData.days; // 天数
    var curMonth = monthData.month; // 月份
    var curYear = monthData.year; // 年份
    var dayList = [];

    for (var i = 1; i <= days; i++) {
      var dayStr = [curYear, curMonth, i].join('-') + ' 00:00:00';
      var dayTimestamp = TimeZone.dateStrToUnix(dayStr, timeZone);

      dayList.push({
        timestamp: dayTimestamp,
        dateStr: TimeZone.formatTimeStamp(dayTimestamp, timeZone, formatStr)
      });
    }

    return dayList;
  };
  
  /**
   * 两个时间戳是否在同一天内
   * @param { Number } timestamp , timestamp2, 时间戳
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   */
  TimeZone.isSameDay = function(timestamp,timestamp2,timeZone){
    if(!timestamp2){
      timestamp2 = Math.round(Date.now() / 1000);
    }
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }
    return TimeZone.getZeroByTimestamp(timestamp,timeZone) === TimeZone.getZeroByTimestamp(timestamp2,timeZone);
  }
  /**
   * 两个时间戳是否在同一年内
   * @param { Number } timestamp , timestamp2, 时间戳
   * @param { Number } timeZone, 时间 东区为负，西区为正，如东8区，-8，默认东8区
   */
  TimeZone.isSameYear = function(timestamp,timestamp2,timeZone){
    if(!timestamp2){
      timestamp2 = Math.round(Date.now() / 1000);
    }
    if(typeof timeZone === 'undefined'){
      timeZone = TimeZone.timeZone;
    }
    return TimeZone.formatTimeStamp(timestamp,timeZone,'YYYY') === TimeZone.formatTimeStamp(timestamp2,timeZone,'YYYY');
  }
  window.TimeZone = TimeZone;
})(window);
