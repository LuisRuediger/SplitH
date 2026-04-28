package com.tcc.splith.repository;

import com.tcc.splith.entity.TransactionSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionSplitRepository extends JpaRepository<TransactionSplit, Long> {
    List<TransactionSplit> findByTransactionId(Long transactionId);
    List<TransactionSplit> findByUserId(Long userId);
}
