package com.tcc.splith.dto.statement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParsedTransactionDTO {

    private LocalDate date;
    private String description;
    private BigDecimal amount;

}
