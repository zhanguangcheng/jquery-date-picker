# jquery-date-picker

基于jQuery的日期选择器

## 快速使用

导入js

```html
<!-- 日期容器 -->
<input type="text" class="date-picker" readonly>

<!-- 导入jQuery -->
<script src="http://cdn.bootcss.com/jquery/1.8.3/jquery.min.js"></script>
<!-- 导入插件 -->
<script src="src/jquery-date-picker.js"></script>
```

调用

```javascript
$('.date-picker').datePicker();
```

## 配置选项

* `id` 日期框的id
* `date` 默认的日期，如：2018-8-8
* `bindTrigger` 触发弹出日期框的元素或选择器
