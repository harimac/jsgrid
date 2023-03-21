(function(jsGrid) {

    jsGrid.locales.ja = {
        grid: {
            noDataContent: "データが見つかりません。",
            deleteConfirm: "削除します。よろしいですか。",
            pagerFormat: "ページ: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; [ {pageIndex} / {pageCount} ]",
            pagePrevText: "前",
            pageNextText: "次",
            pageFirstText: "最初",
            pageLastText: "最後",
            loadMessage: "しばらくお待ちください…",
            invalidMessage: "入力されたデータが不正です。"
        },

        loadIndicator: {
            message: "処理中…"
        },

        fields: {
            totalLabel: "全",
            rowsLabel: "行",
            emptyLabel: "空",
            text: {
                filter_placeholder: "絞り込み条件を入力...",
                insert_placeholder: "挿入する値を入力...",
                edit_placeholder: "編集する値を入力...",
            },
            number: {
              summaryLabel: "合計",
              maximumLabel: "最大値",
              minimumLabel: "最小値",
              meanLabel: "平均値",
              stdDevLabel: "標準偏差"
            },
            select: {
                summaryLabel: "集計",
                filter_placeholder: "絞り込み条件を選択...",
                insert_placeholder: "挿入する値を選択...",
                edit_placeholder: "編集する値を選択...",
            },
            checkbox: {
                summaryLabel: "集計",
                filter_placeholder: "絞り込み条件を選択...",
                insert_placeholder: "挿入する値を選択...",
                edit_placeholder: "編集する値を選択...",
                checked_summary: "チェック済",
                unchecked_summary: "未チェック"
            },
            date: {
                filter_placeholder: "絞り込み期間を指定...",
                applyLabel: "適用",
                cancelLabel: "キャンセル",
                fromLabel: "開始日",
                toLabel: "終了日",
                weekLabel: "週",
                customRangeLabel: "カスタム",
                todayLabel: "今日",
                yesterdayLabel: "昨日",
                last30daysLabel: "直近30日",
                thisMonthLabel: "今月",
                lastMonthLabel: "先月",
                orderYearMonthFunc: function(yearHtml, monthHtml) {
                    return yearHtml + "年 " + monthHtml;
                }
            },
            color: {
                filter_placeholder: "絞り込む色を選択...",
                insert_placeholder: "挿入する色選択...",
                edit_placeholder: "編集する色を選択...",
            },
            control: {
                searchModeButtonTooltip: "検索モードへ",
                insertModeButtonTooltip: "登録モードへ",
                editButtonTooltip: "編集",
                deleteButtonTooltip: "削除",
                searchButtonTooltip: "フィルター",
                clearFilterButtonTooltip: "条件のクリア",
                insertButtonTooltip: "登録",
                updateButtonTooltip: "更新",
                cancelEditButtonTooltip: "編集の取り消し"
            }
        },

        validators: {
          required: { message: "項目 {name} の値の入力が必要です。" },
          rangeLength: { message: "項目 {name} の値の文字数が範囲外です。" },
          minLength: { message: "項目 {name} の値の文字数が短すぎます。" },
          maxLength: { message: "項目 {name} の値の文字数が長すぎます。" },
          pattern: { message: "項目 {name} の値がパターンに一致しません。" },
          range: { message: "項目 {name} の値が範囲外です。" },
          min: { message: "項目 {name} の値が最小値以下です。" },
          max: { message: "項目 {name} の値が最大値以上です。" }
        }
    };
    jsGrid.locales.ja_jp = jsGrid.locales.ja;

}(jsGrid, jQuery));
