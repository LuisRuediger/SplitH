package com.tcc.splith.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Getter
@Setter
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Este campo representa quem pagou a conta inteira (o credor principal daquela nota)
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String description;

    // O valor total da despesa
    private BigDecimal amount;

    @Column(name = "transaction_date")
    private LocalDate date;

    private String category;

    private String account;

    // Alterado de String para relacionamento real com a tabela Group
    @JsonIgnoreProperties({"members", "hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    private String type; // INCOME ou EXPENSE

    // Relacionamento com as frações da conta (quem consumiu o quê)
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionSplit> splits = new ArrayList<>();

    public String getPaidByName() {
        return this.user != null ? this.user.getName() : "Desconhecido";
    }
}